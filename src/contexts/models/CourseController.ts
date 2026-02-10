import { Course, CourseContent, CompletionStatus } from "@/core/model/OattsModel";
import { ContentStateMap } from "../models/ContentStateMap";
import { ContentType } from "./ContentType";

type ControllerReturnType = {
  course: Course | undefined;
  contents: CourseContent[] | undefined;
  contentType: ContentType;
  states: ContentStateMap | undefined;
  isLoading: boolean;
};


/**
 * This REALLY needs a better name...
 */
export class CourseController implements ControllerReturnType {
  course: Course | undefined;
  contents: CourseContent[] | undefined;
  flatContents: CourseContent[] | undefined;
  contentType: ContentType;
  states: ContentStateMap | undefined;
  isLoading: boolean;

  constructor(data: ControllerReturnType) {
    this.course = data.course;
    this.contents = data.contents;
    this.contentType = data.contentType;
    this.states = data.states;
    this.isLoading = data.isLoading;

    const flatten = (contents : CourseContent[]) => {
      let flatContents : CourseContent[] = []
      contents.forEach(c => flatContents = c.children? [...flatContents, c, ...flatten(c.children)] : [...flatContents, c]);
      return flatContents;
    }
    this.flatContents = data.contents? flatten(data.contents) : [];
  }

  getContent(id: string) {1
    return this.flatContents?.find(c => c.id === id);
  }

  getState(id: string) {
    return !this.isLoading && this.states ? this.states[id] : undefined;
  }

  getNext() {
    const incomplete = this.flatContents?.find(
      (x) => !this.isLoading && this.states && this.states[x.id]?.completionStatus !== CompletionStatus.Completed,
    );
    return incomplete?.id || "";
  }

  checkIsComplete() {
    return this.flatContents?.every(
      (x) => !this.isLoading && this.states && this.states[x.id]?.completionStatus === CompletionStatus.Completed,
    );
  }
}
