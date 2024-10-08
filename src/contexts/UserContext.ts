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


