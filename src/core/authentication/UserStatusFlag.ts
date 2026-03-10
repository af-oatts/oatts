
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import User, { UserStatusFlag } from "@/core/model/UserModel";
import { storeUserStatusFlag } from "./Authenticator";

export async function addUserStatusFlag(user: User, flag: UserStatusFlag) {
  if (user.statusFlags.includes(flag)) return;

  user.statusFlags.push(flag);
  await storeUserStatusFlag(user.email, flag);
}
