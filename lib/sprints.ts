import { randomUUID } from "crypto";

export type SprintStatus = "active" | "closed";

export type Sprint = {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdBy: string;
  createdAt: string;
  closedAt?: string;
  summaryNotes?: string;
};

const sprints = new Map<string, Sprint>();

export function createSprint(
  name: string,
  goal: string,
  startDate: string,
  endDate: string,
  createdBy: string
): Sprint {
  const sprint: Sprint = {
    id: randomUUID(),
    name,
    goal,
    startDate,
    endDate,
    status: "active",
    createdBy,
    createdAt: new Date().toISOString(),
  };
  sprints.set(sprint.id, sprint);
  return sprint;
}

export function getAllSprints(): Sprint[] {
  return Array.from(sprints.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getActiveSprint(): Sprint | null {
  return Array.from(sprints.values()).find((s) => s.status === "active") || null;
}

export function getSprintById(id: string): Sprint | null {
  return sprints.get(id) || null;
}

export function closeSprint(id: string, summaryNotes?: string): Sprint | null {
  const sprint = sprints.get(id);
  if (!sprint) return null;
  const updated: Sprint = {
    ...sprint,
    status: "closed",
    closedAt: new Date().toISOString(),
    summaryNotes,
  };
  sprints.set(id, updated);
  return updated;
}
