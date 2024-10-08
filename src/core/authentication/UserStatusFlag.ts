import User, { UserStatusFlag } from "@/core/model/UserModel";
import { storeUserStatusFlag } from "./Authenticator";

export async function addUserStatusFlag(user: User, flag: UserStatusFlag) {
  if (user.statusFlags.includes(flag)) return;

  user.statusFlags.push(flag);
  await storeUserStatusFlag(user.email, flag);
}
