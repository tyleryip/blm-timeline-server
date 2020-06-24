import { mapKeys } from "../util/db";

export default interface User {
  id: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export const fromDatabase = (obj: Record<string, any>): User => {
  return mapKeys(obj, [
    ['is_admin', 'isAdmin'],
  ]) as User;
};
