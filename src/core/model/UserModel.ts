
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

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