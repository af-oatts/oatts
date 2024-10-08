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