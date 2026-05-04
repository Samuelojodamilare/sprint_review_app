import { randomUUID, createHash } from "crypto";
import type { Role } from "./auth";

export type User = {
  id: string;
  name: string;
  email: string;
  hash: string;
  salt: string;
  role: Role;
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

  // First user to register becomes admin — role is never accepted from the client
  const role: Role = users.size === 0 ? "admin" : "user";

  const user: User = { id: randomUUID(), name, email, hash, salt, role };
  users.set(email, user);
  return user;
}

export function findUserByEmail(email: string) {
  return users.get(email) || null;
}

export function updateUserRole(email: string, role: Role): boolean {
  const user = users.get(email);
  if (!user) return false;
  users.set(email, { ...user, role });
  return true;
}

export { users };
