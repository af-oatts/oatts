export type ScormModel = {
  cmi: {
    // Represents the version of the data model
    _version: string;
    comments_from_learner: {
      // Current number of learner comments
      _count: number; 
      // Listing of supported data model elements
      _children: Comment[];
    };
    comments_from_lms: {
      // Current number of comments from the LMS
      _count: number;
      // Listing of supported data model elements
      _children: Comment[];
    };
    // Indicates whether the learner has completed the SCO
    completion_status: CompletionStatus;
    // Used to determine whether the SCO should be considered complete
    completion_threshold: number;
    // Indicates whether the learner will be credited for performance in the SCO
    credit: Credit;
    //  Asserts whether the learner has previously accessed the SCO
    entry: Entry;
    // Indicates how or why the learner left the SCO
    exit: Exit;
    interactions: {
      // Listing of supported data model elements
      _children: Interaction[];
      //  Current number of interactions being stored by the LMS
      _count: number;
    };
    // Data provided to a SCO after launch, initialized from the dataFromLMS manifest element
    launch_data: string;
    // Identifies the learner on behalf of whom the SCO was launched
    learner_id: string;
    // Name provided for the learner by the LMS
    learner_name: string;
    learner_preference: {
      _children: LearnerPreference[];
      // Specifies an intended change in perceived audio level
      audio_level: number;
      // The learner’s preferred language for SCOs with multilingual capability
      language: string;
      // The learner’s preferred relative speed of content delivery
      delivery_speed: number;
      // Specifies whether captioning text corresponding to audio is displayed
      audio_captioning: "-1" | "0" | "1";
    };
    // The learner’s current location in the SCO
    location: string;
    // Amount of accumulated time the learner is allowed to use a SCO
    max_time_allowed: string; // TODO (timeinterval (second,10,2))
    // Identifies one of three possible modes in which the SCO may be presented to the learner
    mode: Mode;
    objectives: {
      // Listing of supported data model elements
      _children: Objective[];
      // Current number of objectives being stored by the LMS
      _count: number;
    };
    // Measure of the progress the learner has made toward completing the SCO
    progress_measure: number; // range (0..1)
    // Scaled passing score required to master the SCO
    scaled_passing_score: number; // range (-1..1)
    score: Score;
    // Amount of time that the learner has spent in the current learner session for this SCO
    session_time: string; // TODO timeinterval (second,10,2)
    // Indicates whether the learner has mastered the SCO
    success_status: SuccessStatus;
    //  Provides space to store and retrieve data between learner sessions
    suspend_data: string;
    //  Indicates what the SCO should do when cmi.max_time_allowed is exceeded
    time_limit_action: TimeLimitAction;
    // Sum of all of the learner’s session times accumulated in the current learner attempt
    total_time: string; // TODO (timeinterval (second,10,2))
  };
}

export type Comment = {
  // Textual input
  comment: string;
  // Point in the SCO to which the comment applies
  location: string;
  // Point in time at which the comment was created or most recently changed
  timestamp: string; //TODO: (time (second,10,0))
}

export type Interaction = {
  // Unique label for the interaction
  id: string;
  // Type of interaction
  type: InteractionType;
  // Array of objectives associated with the interaction
  objectives: {
    // Current number of objectives (i.e., objective identifiers) being stored by the LMS for this interaction
    _count: number;
    // Not an official part of datamodel, but all the other collections use the "_children" property
    _children: ObjectiveIdentifier[];
  };
  // Point in time at which the interaction was first made available to the learner for learner interaction and response
  timestamp: string; // TODO time(second,10,0)
  correct_responses: {
    // Current number of correct responses being stored by the LMS for this interaction
    _count: number;
    // Not an official part of datamodel, but all the other collections use the "_children" property
    _children: CorrectResponse[];
   } // Array of correct responses
   // Weight given to the interaction relative to other interactions
  weighting: number;
  // Data generated when a learner responds to an interaction
  learner_response: any; // format depends on interaction type
  // Judgment of the correctness of the learner response
  result: Result | number; // Apparently it can also be "a real number with values that is accurate to seven significant decimal figures real" whatever that means
  // Time elapsed between the time the interaction was made available to the learner for response and the time of the first response
  latency: number; // TODO (timeinterval (second,10,2))
  // Brief informative description of the interaction
  description: string;
}

export type ObjectiveIdentifier = {
  id: string; // Label for objectives associated with the interaction
}

export type CorrectResponse = {
  // One correct response pattern for the interaction
  pattern: any; // format depends on the interaction type, so "any" it is
}

export type LearnerPreference = {
  // Specifies an intended change in perceived audio level
  audio_level: number;
  // The learner’s preferred language for SCOs with multilingual capability
  language: string;
  // The learner’s preferred relative speed of content delivery
  delivery_speed: number;
  // Specifies whether captioning text corresponding to audio is displayed
  audio_captioning: "-1" | "0" | "1";
}

export type Objective = {
  // Unique label for the objective
  id: string;
  score: {
    // Listing of supported data model elements
    _children: Score[];
    // Number that reflects the performance of the learner for the objective
    scaled: number; // range should be (-1 to 1)
    // Number that reflects the performance of the learner, for the objective, relative to the range bounded by the values of min and max
    raw: number;
    // Minimum value, for the objective, in the range for the raw score
    min: number;
    // Maximum value, for the objective, in the range for the raw score
    max: number;
  };
  // Indicates whether the learner has mastered the objective
  success_status: SuccessStatus;
  // Indicates whether the learner has completed the associated objective
  completion_status: CompletionStatus;
  // Measure of the progress the learner has made toward completing the objective
  progress_measure: number; // range (0..1)
  // Provides a brief informative description of the objective
  description: string;
}

export type Score = {
  // Number that reflects the performance of the learner for the objective
  scaled: number; // range should be (-1..1)
  // Number that reflects the performance of the learner, for the objective, relative to the range bounded by the values of min and max
  raw: number;
  // Minimum value, for the objective, in the range for the raw score
  min: number;
  // Maximum value, for the objective, in the range for the raw score
  max: number;
}

export enum SuccessStatus {
  Passed = "passed",
  Failed = "failed",
  Unknown = "unknown"
}

export enum TimeLimitAction {
  ExitMessage = "exit,message",
  ContinueMessage = "continue,message",
  ExitNoMessage = "exit,no message",
  ContinueNoMessage = "continue,no message"
}

export enum Mode {
  Browse = "browse",
  Normal = "normal",
  Review = "review"
}

export enum InteractionType {
  TrueFalse = "true-false",
  Choice = "choice",
  FillIn = "fill-in",
  LongFillIn = "long-fill-in",
  Matching = "matching",
  Performance = "performance",
  Sequencing = "sequencing",
  Likert = "likert",
  Numeric = "numeric",
  Other = "other"
}

export enum Result {
  Correct = "correct",
  Incorrect = "incorrect",
  Unanticipated = "unanticipated",
  Neutral = "neutral"
}

export enum CompletionStatus {
  Unknown = "unknown",
  Completed = "completed",
  Incomplete = "incomplete",
  NotAttempted = "not attempted"
}

export enum Credit {
  Credit = "credit",
  NoCredit = "no-credit"
}

export enum Entry {
  AbInitio = "ab_initio",
  Resume = "resume"
}

export enum Exit {
  Unknown = "",
  Timeout = "timeout",
  Suspend = "suspend",
  Logout = "logout",
  Normal = "normal"
}

export type ScormDbEntity = {
  userId: string,
  contentUri: string,
  data: string
}