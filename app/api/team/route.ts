import { NextRequest, NextResponse } from "next/server";
import { TeamMember } from "@/lib/types";
import { getTeamMembers, saveTeamMembers } from "@/lib/redis";

function generateId(): string {
  return crypto.randomUUID();
}

// ─── GET /api/team ───────────────────────────────────────────────────────────
export async function GET() {
  try {
    const members = await getTeamMembers();
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to read team members:", error);
    return NextResponse.json(
      { error: "Failed to load team members" },
      { status: 500 }
    );
  }
}

// ─── POST /api/team ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, track, topFive, strengthsSixToTen, dominantDomain, secondaryDomain, gap, persona, topRoleMatch } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!track || !topFive || !Array.isArray(topFive) || topFive.length === 0) {
      return NextResponse.json({ error: "Missing required strength data" }, { status: 400 });
    }

    const members = await getTeamMembers();

    // Check for existing member by name (case-insensitive)
    const existingIndex = members.findIndex(
      (m) => m.name.toLowerCase() === name.trim().toLowerCase()
    );

    const memberData: TeamMember = {
      id: existingIndex >= 0 ? members[existingIndex].id : generateId(),
      name: name.trim(),
      track,
      topFive,
      strengthsSixToTen: strengthsSixToTen || [],
      dominantDomain: dominantDomain || "",
      secondaryDomain: secondaryDomain || "",
      gap: gap || "",
      persona: persona || "",
      topRoleMatch: topRoleMatch || "",
      timestamp: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing member
      members[existingIndex] = memberData;
    } else {
      // Add new member
      members.push(memberData);
    }

    await saveTeamMembers(members);

    return NextResponse.json({
      success: true,
      member: memberData,
      isUpdate: existingIndex >= 0,
    });
  } catch (error) {
    console.error("Failed to save team member:", error);
    return NextResponse.json(
      { error: "Failed to save team member" },
      { status: 500 }
    );
  }
}
