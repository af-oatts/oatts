import {
  OldContentItem,
  OldContentType,
  OldContentMetadata,
  ContentState,
  Role,
  QuizContent,
  RawOattsManifest,
  RawCourse,
  Course,
  CourseContent,
  CourseContentItemType,
  RawCourseContent,
  OattsManifest,
} from "@/core/model/OattsModel";
import { join } from "@tauri-apps/api/path";
import { parse } from "yaml";
import { FetchFile } from "../utils/FileHelper";
import User from "@/core/model/UserModel";
import { loadModel } from "../scorm/ScormHelper";
import { OATTS_ROOT } from "../utils/Globals";
import { internalizeCompletionStatus } from "../scorm/ScormInternalizer";
import { GetInternalContentState } from "../database/Content";
import { UserContextType } from "../../contexts/UserContext";
import CoursesContext from "./ContentContext";
import { ScormModel } from "../model/ScormModel";



export async function GetCoursesWithState(user: User, config: OattsManifest): Promise<Course[]> {
  let courses = config.courses;
  await Promise.all(courses.map((course) => StatefulifyRawCourse(course, user)));
  return courses;
}


// Adds state to a raw course, returning a course.
async function StatefulifyRawCourse(course: RawCourse, user: User): Promise<Course> {
  let statefulContents: CourseContent[] = []
  for (const content of course.contents) {
    let statefulContent = await StatefulifyRawContent(content, user);
    statefulContents.push(statefulContent);
  }

  return {
    id: course.id,
    name: course.name,
    roleIds: course.roleIds,
    description: course.description,
    img: course.img,
    paNumber: course.paNumber,
    timeToComplete: course.timeToComplete,
    contents: statefulContents,
  }
}

async function StatefulifyRawContent(content: RawCourseContent, user: User): Promise<CourseContent> {
  // Populate any children.
  let statefulChildren: CourseContent[] = []
  if(content.type === CourseContentItemType.SUBMODULE && content.children != null) {
    for(let child of content.children) {
      let statefulChild = await StatefulifyRawContent(child, user);
      statefulChildren.push(statefulChild);
    }
  }


  let internalState = await GetInternalContentState(user, content.id);
  
  let scormState: ScormModel | undefined = undefined
  
  if(content.type === CourseContentItemType.SCORM) {
    const stateModel = await loadModel(user, content.id);
    scormState = stateModel;
    if(internalState != undefined) {
      internalState!.completionStatus = internalizeCompletionStatus(stateModel.cmi.completion_status);
    }
  }

  return {
    id: content.id,
    name: content.name,
    type: content.type,
    description: content.description,
    entrypoint: content.entrypoint,
    children: statefulChildren,
    state: internalState ?? new ContentState(),
    scormState: scormState
  }

}


function roleIdsToRoles(roleIds: string[], availableRoles: Role[]): Role[] {
  const roles = availableRoles.filter((r) => roleIds.includes(r.id));

  return roles;
}


export async function LoadQuiz(manifest: OattsManifest, quizId: string): Promise<QuizContent[] | undefined> {

  const quizPath = await join(OATTS_ROOT, quizId);
  const metadataPath = await join(quizPath, ".oatts");
  const metadataString = await FetchFile(metadataPath, "text/yaml");
  if (metadataString === undefined) {
    console.warn("Unable to find quiz metadata in", metadataPath);
    return undefined;
  }

  const quizConfig: QuizConfigFile = parse(metadataString);
  if (quizConfig.contents === undefined) 
    return undefined;

  const quizContentConfigPromises = quizConfig.contents.map(async (contentId) => {
    const contentPath = await join(quizPath, contentId.name);
    const contentMetadataPath = await join(contentPath, ".oatts");
    const contentMetadataString = await FetchFile(contentMetadataPath, "text/yaml");
    if (contentMetadataString === undefined) {
      console.warn("Unable to find quiz content metadata in", contentMetadataPath);
      return undefined;
    }

    const cfg: QuizContentConfigFile = parse(contentMetadataString);
    if (cfg.contentConfig === undefined) {
      return undefined;
    }

    const contentItem = await contentCfgToItem(cfg.contentConfig, contentPath);
    const roles = roleIdsToRoles(cfg.roleIds, manifest.roles);

    return {content: contentItem, roles: roles};
  });

  const potentiallyUndefinedQuizContents = await Promise.all(quizContentConfigPromises);
  const quizContents = potentiallyUndefinedQuizContents.filter((c) => c !== undefined);

  return quizContents;
}

async function contentCfgToItem(config: ContentMetadataFile, contentPath: string): Promise<OldContentItem> {
  let contentId = contentPath.replace("/\s\g", "");
  contentId = contentId.replaceAll("/", "_");
  let metadata: OldContentMetadata = {
    name: config.name,
    description: config.description,
    id: contentId,
  };

  let contentState = new ContentState();

  let content: OldContentItem = {
    metadata: metadata,
    type: config.type,
    workingDir: contentPath,
    state: contentState,
  };

  if (config.type === OldContentType.CONTAINER && config.contents !== undefined) {
    let subcontent = await Promise.all(
      config.contents.map(async (desc) => {
        let path = await join(contentPath, desc.name);
        return LoadContent(path)
  }),
    );
    content.subContents = subcontent.filter((c) => c !== undefined);
  } else if (typeof config.dataPath === "string") {
    let fullPath = await join(contentPath, config.dataPath);
    content.content = fullPath;
  }

  return content;
}

async function LoadContent(contentPath: string): Promise<OldContentItem | undefined> {
  let metadataFile = await LoadContentMetadata(contentPath);
  if (metadataFile === undefined) {
    return undefined;
  }

  return contentCfgToItem(metadataFile, contentPath);
}

async function LoadContentMetadata(path: string): Promise<ContentMetadataFile | undefined> {
  let metadataPath = await join(path, ".oatts");
  let metadataString = await FetchFile(metadataPath, "text/yaml");
  if (metadataString === undefined) {
    console.warn("Unable to find content metadata in", metadataPath);
    return undefined;
  }

  let metadata: ContentMetadataFile = parse(metadataString);
  return metadata;
}
                            
type ContentMetadataFile = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: OldContentType;
  readonly dataPath?: string;
  readonly contents?: Descriptor[];
};

type QuizContentConfigFile = {
  readonly roleIds: string[];
  readonly contentConfig?: ContentMetadataFile;
}

type QuizConfigFile = {
  readonly id: string;
  readonly contents?: Descriptor[];
}

type Descriptor = {
  readonly name: string; // file name
}


export async function loadRequiredAndOptionalCourses({ context}: { context: { authentication: UserContextType; courses: CoursesContext; config: RawOattsManifest }}) {
  const user = context.authentication.user;
  if (user === undefined) {
    console.error("No user set while attempting to retrieve modules");
    return { required: [], optional: [] };
  }


  let courses: Course[] = []
  // Un-raw? Cook? Statefulify? The raw course.
  for(let rawCourse of context.config.courses)  {
    const statefulCourse = await StatefulifyRawCourse(rawCourse, user);
    courses.push(statefulCourse);
  }


  let focusedCourses: Course[] = [];
  let supplementaryCourses: Course[] = [];

  // Sort focused and supplementary.
  for(let course of courses) {
    for(let role of user.roles) {
      if(course.roleIds.includes(role)) {
        focusedCourses.push(course)
        break;
      }
    }
    supplementaryCourses.push(course)
  }

  return { required: focusedCourses, optional: supplementaryCourses };
}
