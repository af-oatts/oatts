
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

export type ScormMetadata = {
  general?: General,
  educational?: Educational,
  description?: ScormDescription,
}

type General = {
  identifier?: Identifier,
  title?: ScormTitle
}

type Educational = {
  typicalLearningTime: TypicalLearningTime
}

type Identifier = {
  catalog: string,
  entry: string,
}

type TypicalLearningTime = {
  duration: string,
  description: ScormDescription
}

type ScormDescription = {
  string: ScormString
}

type ScormTitle = {
  string: ScormString
}

type ScormString = {
  _: string,
  language: string
}