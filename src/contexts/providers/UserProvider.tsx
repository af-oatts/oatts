
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import User from "@/core/model/UserModel";
import { useState } from "react";
import { UserContext } from "../UserContext";


export function UserProvider({ children }: Readonly<{ children: React.ReactNode; }>) {
  const [user, setUser] = useState<User>();
  const [_, setToken] = useState<string | null>(null);

  const login = (userToken: string) => {
    setToken(userToken);
  };

  const logout = () => {
    setToken(null);
    setUser(undefined);
  };

  return (
    <UserContext.Provider value={{ user: user, login: login, logout: logout, setUser: setUser }}>
      {children}
    </UserContext.Provider>
  );
}
