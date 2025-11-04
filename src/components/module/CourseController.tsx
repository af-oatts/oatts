import { Course, CourseContent, CompletionStatus } from "@/core/model/OattsModel";
import { ContentStateMap } from "./useCourseContentState";

type ControllerReturnType = {
  course: Course | undefined;
  contents: CourseContent[] | undefined;
  states: ContentStateMap | undefined;
  isLoading: boolean;
};

export class CourseController implements ControllerReturnType {
  course: Course | undefined;
  contents: CourseContent[] | undefined;
  states: ContentStateMap | undefined;
  isLoading: boolean;

  constructor(data: ControllerReturnType) {
    this.course = data.course;
    this.contents = data.contents;
    this.states = data.states;
    this.isLoading = data.isLoading;
  }

  getContent(id: string) {
    return this.contents?.find((x) => x.id === id);
  }

  getState(id: string) {
    return this.states ? this.states[id] : undefined;
  }

  getNext() {
    const incomplete = this.contents?.find(
      (x) => this.states && this.states[x.id].completionStatus !== CompletionStatus.Completed,
    );
    return incomplete?.id || "";
  }
}
