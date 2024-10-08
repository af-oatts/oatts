import {
  Module,
  ContentItem,
  ContentType,
  ContentMetadata,
  ContentState,
  ManifestMetadata,
  OattsConfig,
  Role,
  QuizContent,
} from "@/core/model/OattsModel";
import { join } from "@tauri-apps/api/path";
import { parse } from "yaml";
import { FetchFile } from "../utils/FileHelper";
import { PopulateInfoFromScorm } from "../scorm/ScormLoader";
import User from "@/core/model/UserModel";
import { loadModel } from "../scorm/ScormHelper";
import { OATTS_ROOT } from "../utils/Globals";
import { internalizeCompletionStatus } from "../scorm/ScormInternalizer";
import { populateContentState } from "../database/Content";
import { UserContextType } from "../../contexts/UserContext";
import ModuleContext from "./ModuleContext";

export async function GetModulesWithState(user: User, config: OattsConfig): Promise<Module[]> {

  const modules = await GetModules(config);
  await Promise.all(modules.map((mod) => PopulateModuleState(mod, user)));
  return modules;
}

async function PopulateModuleState(module: Module, user: User) {
  for (const content of module.contents) {
    await PopulateInternalState(content, user);
    await PopulateScormState(content, user);
  }
}

async function PopulateInternalState(content: ContentItem, user: User) {
  if (content.type === ContentType.CONTAINER && content.subContents !== undefined) {
    for (const subContent of content.subContents) {
      await PopulateInternalState(subContent, user);
    }
  } else {
    await populateContentState(user, content.metadata.id, content.state);
  }
}

async function PopulateScormState(content: ContentItem, user: User) {
  if (content.type === ContentType.CONTAINER && content.subContents !== undefined) {
    for (const subContent of content.subContents) {
      await PopulateScormState(subContent, user);
    }
  } else {
    if (content.type !== ContentType.SCORM) {
      return;
    }

    const stateModel = await loadModel(user, content.metadata.id);
    content.scormState = stateModel;
    content.state.completionStatus = internalizeCompletionStatus(stateModel.cmi.completion_status);
  }
}

export async function GetModules(config: OattsConfig): Promise<Module[]> {
  let modules = await Promise.all(config.modules.map(async (mod) => await LoadModule(mod, config.roles)));
  return modules.filter((mod) => mod !== undefined);
}

function roleIdsToRoles(roleIds: string[], availableRoles: Role[]): Role[] {
  const roles = availableRoles.filter((r) => roleIds.includes(r.id));

  return roles;
}

export async function LoadModule(moduleManifestData: ManifestMetadata, roles: Role[]): Promise<Module | undefined> {
  let metadata = await LoadModuleMetadata(moduleManifestData.name);
  if (metadata === undefined) {
    return undefined;
  }

  // some content may be undefined if there was trouble loading it
  let allContents = await Promise.all(metadata.contents.map(async (descriptor) => {
    const path = await join(metadata.path, descriptor.name);
    return LoadContent(path);
  }));

  let contents = allContents.filter((c) => c !== undefined);
  for (const content of contents) {
    await PopulateInfoFromScorm(content);
  }

  const moduleRoles = roleIdsToRoles(metadata.roleIds ?? [], roles);

  let module: Module = {
    id: metadata.id ?? metadata.name,
    description: metadata.description ?? "",
    paNumber: metadata.paNumber,
    name: metadata.name,
    timeToComplete: metadata.timeToComplete,
    roles: moduleRoles,
    contents: contents,
  };

  if (metadata.previewImage != undefined) {
    let previewImagePath = await join(OATTS_ROOT, moduleManifestData.name, metadata.previewImage);
    module.previewImage = previewImagePath;
  }

  return module;
}

export async function LoadQuiz(oattsCfg: OattsConfig, quizId?: string): Promise<QuizContent[] | undefined> {
  if (quizId == undefined)
    return undefined;

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
    const roles = roleIdsToRoles(cfg.roleIds, oattsCfg.roles);

    return {content: contentItem, roles: roles};
  });

  const potentiallyUndefinedQuizContents = await Promise.all(quizContentConfigPromises);
  const quizContents = potentiallyUndefinedQuizContents.filter((c) => c !== undefined);

  return quizContents;
}

async function contentCfgToItem(config: ContentMetadataFile, contentPath: string): Promise<ContentItem> {
  let contentId = contentPath.replace("/\s\g", "");
  contentId = contentId.replaceAll("/", "_");
  let metadata: ContentMetadata = {
    name: config.name,
    description: config.description,
    id: contentId,
  };

  let contentState = new ContentState();

  let content: ContentItem = {
    metadata: metadata,
    type: config.type,
    workingDir: contentPath,
    state: contentState,
  };

  if (config.type === ContentType.CONTAINER && config.contents !== undefined) {
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

async function LoadContent(contentPath: string): Promise<ContentItem | undefined> {
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

async function LoadModuleMetadata(modName: string): Promise<ModuleMetadataFile | undefined> {
  let modulePath = await join(OATTS_ROOT, modName);
  let metadataPath = await join(modulePath, ".oatts");
  let metadataString = await FetchFile(metadataPath, "text/yaml");
  if (metadataString === undefined) {
    console.warn("Unable to find module metadata for", modName, "In path:", metadataPath);
    return undefined;
  }
  let metadata: ModuleMetadataFile = parse(metadataString);
  metadata.path = modulePath;
  return metadata;
}
                            
type ContentMetadataFile = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ContentType;
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

// The module metadata as provided by the module's yaml file.
type ModuleMetadataFile = {
  readonly id?: string;
  readonly name: string;
  readonly description?: string;
  readonly paNumber?: string;
  readonly previewImage?: string;
  readonly roleIds?: string[];
  readonly timeToComplete? : number;
  readonly contents: Descriptor[];
  path: string;
};

export async function loadRequiredAndOptionalModules({
  context,
}: {
  context: { authentication: UserContextType; modules: ModuleContext; config: OattsConfig };
}) {
  const user = context.authentication.user;
  if (user === undefined) {
    console.error("No user set while attempting to retrieve modules");
    return { required: [], optional: [] };
  }
  const allModules = await GetModulesWithState(user, context.config);
  context.modules.modules = allModules;
  const focusedModules = allModules.filter((module) =>
    user.roles.some((cat) => module.roles.map(r => r.id).includes(cat)),
  );
  const supplementaryModules = allModules.filter((module) => !focusedModules.includes(module));
  return { required: focusedModules, optional: supplementaryModules };
}
