
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { CourseContentItemType, CourseContent } from "@/core/model/OattsModel";

import { ScormContentViewer } from "./ScormContentViewer";
import { GenericContentViewer } from "./GenericContentViewer";

export default function ContentViewer({ content }: { content: CourseContent }) {
  return content.type === CourseContentItemType.SCORM ? (
    <ScormContentViewer content={content}></ScormContentViewer>
  ) : (
    <GenericContentViewer content={content}></GenericContentViewer>
  )
}
