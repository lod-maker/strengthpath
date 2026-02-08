import { NextRequest, NextResponse } from "next/server";
import { getTeamMembers, saveTeamMembers } from "@/lib/redis";

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

    const members = await getTeamMembers();
    const memberIndex = members.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const removedMember = members[memberIndex];
    members.splice(memberIndex, 1);
    await saveTeamMembers(members);

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
