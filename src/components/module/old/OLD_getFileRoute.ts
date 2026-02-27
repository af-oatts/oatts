import { ContentType } from "../../../contexts/models/ContentType";

export function OLD_getFileRoute(contentType: ContentType) {
  switch (contentType) {
    case "content":
      return `/_authenticated/_authorized/courses/$courseId/content/$contentId`;
    case "prequiz":
      return `/_authenticated/onboarding/$courseId/prequiz/$contentId`;
    case "postquiz":
      return `/_authenticated/_authorized/courses/$courseId/postquiz/$contentId`;
    default:
      throw Error("Invalid contentType");
  }
}

export function OLD_getShortFileRoute(contentType: ContentType) {
  switch (contentType) {
    case "content":
      return `/courses/$courseId/content/$contentId`;
    case "prequiz":
      return `/onboarding/$courseId/prequiz/$contentId`;
    case "postquiz":
      return `/courses/$courseId/postquiz/$contentId`;
    default:
      throw Error("Invalid contentType");
  }
}
