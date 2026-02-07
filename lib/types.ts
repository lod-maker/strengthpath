// ─── Gallup Strengths Types ──────────────────────────────────────────────────

export type ExtractedStrength = {
  rank: number;
  name: string;
  description: string;
};

export type ExtractedStrengths = ExtractedStrength[];

// ─── Track Types ─────────────────────────────────────────────────────────────

export type TrackId = "tech_transformation" | "tech_delivery" | "modern_engineering";

export type Track = {
  id: TrackId;
  title: string;
  summary: string;
  accessibleRoles: string[];
};

// ─── Accenture Role Types ────────────────────────────────────────────────────

export type RoleDomain =
  | "Research & Design"
  | "Development & Engineering"
  | "Data"
  | "Automation & Cloud"
  | "Architecture"
  | "Quality & Testing"
  | "Delivery & Management";

export type AccentureRole = {
  name: string;
  domain: RoleDomain;
  description: string;
  strengthsFit: string[];
};

// ─── AI Analysis Response Types (27-role matching) ───────────────────────────

export type FitTier = "Exceptional Fit" | "Strong Fit" | "Good Fit" | "Moderate Fit" | "Developing Fit";

export type StrengthAlignment = {
  strength: string;
  relevance: string;
};

export type RoleMatch = {
  rank: number;
  role: string;
  fitScore: number;
  fitTier: FitTier;
  withinCurrentTrack: boolean;
  matchReason: string;
  strengthAlignments: StrengthAlignment[];
  dayInTheLife: string;
  growthTip: string;
};

export type OutsideTrackRole = {
  role: string;
  fitScore: number;
  fitTier: FitTier;
  currentTrack: string;
  naturalTrack: string;
  explanation: string;
};

export type StrengthDomains = {
  executing: string[];
  influencing: string[];
  relationshipBuilding: string[];
  strategicThinking: string[];
  dominantDomain: string;
  secondaryDomain: string;
};

export type TeamComplementarity = {
  yourContribution: string;
  seekInTeammates: string[];
  idealTeamComposition: string;
};

export type DevelopmentItem = {
  gap: string;
  risk: string;
  action: string;
};

export type AnalysisResult = {
  strengthDomains: StrengthDomains;
  topRoleMatches: RoleMatch[];
  topRolesOutsideTrack: OutsideTrackRole[];
  teamComplementarity: TeamComplementarity;
  developmentPlan: DevelopmentItem[];
  quickSummary: string;
};

// ─── App State Types ─────────────────────────────────────────────────────────

export type AppStep = "upload" | "loading" | "results";

export type LoadingPhase =
  | "extracting"
  | "analyzing"
  | "generating";
