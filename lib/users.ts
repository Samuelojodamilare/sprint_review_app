import { randomUUID, createHash } from "crypto";

export type User = {
  id: string;
  name: string;
  email: string;
  hash: string;
  salt: string;
};

const users = new Map<string, User>();

export function hashPassword(password: string, salt: string) {
  return createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

export function createUser(name: string, email: string, password: string) {
  const salt = randomUUID();
  const hash = hashPassword(password, salt);
  const user: User = { id: randomUUID(), name, email, hash, salt };
  users.set(email, user);
  return user;
}

export function findUserByEmail(email: string) {
  return users.get(email) || null;
}

export { users };
