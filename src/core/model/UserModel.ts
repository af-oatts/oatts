export default class User {
  id?: number;
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  base: string = "";
  statusFlags: UserStatusFlag[] = [];
  roles: string[] = [];
}

export enum UserStatusFlag {
  Onboarded = "Onboarded",
  PreQuizzed = "PreQuizzed",
  PostQuizzed = "PostQuizzed",
}