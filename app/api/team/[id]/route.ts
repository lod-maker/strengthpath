import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { TeamMember } from "@/lib/types";

const DATA_FILE = join(process.cwd(), "data", "team-results.json");

function getTeamMembers(): TeamMember[] {
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveTeamMembers(members: TeamMember[]): void {
  writeFileSync(DATA_FILE, JSON.stringify(members, null, 2));
}

// ─── DELETE /api/team/[id] ───────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const members = getTeamMembers();
    const memberIndex = members.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const removedMember = members[memberIndex];
    members.splice(memberIndex, 1);
    saveTeamMembers(members);

    return NextResponse.json({
      success: true,
      removed: removedMember.name,
    });
  } catch (error) {
    console.error("Failed to delete team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
