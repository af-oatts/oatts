
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import User from "@/core/model/UserModel";
import { createContext } from "react";

export interface UserContextType {
  user: User | undefined;
  setUser: (user: User) => void;
  login: (token: string) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: undefined,
  login: (_) => {},
  logout: () => {},
  setUser: function (_): void {
    throw new Error("Function not implemented.");
  },
});


