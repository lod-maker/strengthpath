import { Redis } from "@upstash/redis";
import { TeamMember } from "@/lib/types";

export const redis = Redis.fromEnv();

const TEAM_KEY = "team:members";

export async function getTeamMembers(): Promise<TeamMember[]> {
  const members = await redis.get<TeamMember[]>(TEAM_KEY);
  return members ?? [];
}

export async function saveTeamMembers(members: TeamMember[]): Promise<void> {
  await redis.set(TEAM_KEY, members);
}
