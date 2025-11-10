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

export class CourseController implements ControllerReturnType {
  course: Course | undefined;
  contents: CourseContent[] | undefined;
  contentType: ContentType;
  states: ContentStateMap | undefined;
  isLoading: boolean;

  constructor(data: ControllerReturnType) {
    this.course = data.course;
    this.contents = data.contents;
    this.contentType = data.contentType;
    this.states = data.states;
    this.isLoading = data.isLoading;
  }

  getContent(id: string) {
    return this.contents?.find((x) => x.id === id);
  }

  getState(id: string) {
    return !this.isLoading && this.states ? this.states[id] : undefined;
  }

  getNext() {
    const incomplete = this.contents?.find(
      (x) => !this.isLoading && this.states && this.states[x.id].completionStatus !== CompletionStatus.Completed,
    );
    return incomplete?.id || "";
  }

  checkIsComplete() {
    return this.contents?.every(
      (x) => !this.isLoading && this.states && this.states[x.id]?.completionStatus === CompletionStatus.Completed,
    );
  }
}
