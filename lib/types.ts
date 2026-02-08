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

// ─── AI Analysis Response Types ──────────────────────────────────────────────

export type PersonaDomain = {
  name: string;
  description: string;
};

export type PersonaGap = {
  domain: string;
  description: string;
};

export type Persona = {
  moniker: string;
  narrative: string;
  topFive: string[];
  dominantDomain: PersonaDomain;
  secondaryDomain: PersonaDomain;
  gap: PersonaGap;
};

export type DomainStrength = {
  name: string;
  rank: number;
  drive: string;
};

export type DomainMapping = {
  domain: string;
  isPrimary: boolean;
  strengths: DomainStrength[];
};

export type PerfectFitRole = {
  role: string;
  stars: number;
  why: string;
  synergy: string;
  watchOut: string;
};

export type StretchRole = {
  role: string;
  stars: number;
  naturalTrack: string;
  why: string;
  timeline: string;
};

export type CautionRole = {
  role: string;
  stars: number;
  friction: string;
  mismatch: string;
};

export type TeammateStrength = {
  strength: string;
  why: string;
};

export type TeamDynamics = {
  whatYouBring: string;
  seekOutTeammatesWith: TeammateStrength[];
  idealTeamComposition: string;
};

export type ActionPlan = {
  immediatePlacement: { role: string; why: string };
  sixMonthDevelopment: string;
  blindSpotManagement: string;
  eighteenMonthTarget: { role: string; requirement: string };
};

export type AnalysisResult = {
  persona: Persona;
  domainMapping: DomainMapping[];
  perfectFitRoles: PerfectFitRole[];
  stretchRoles: StretchRole[];
  cautionRoles: CautionRole[];
  teamDynamics: TeamDynamics;
  actionPlan: ActionPlan;
};

// ─── Session Result (future Team Builder support) ───────────────────────────

export type SessionResult = {
  name: string;
  track: TrackId;
  strengths: ExtractedStrengths;
  analysis: AnalysisResult;
  timestamp: string;
};

// ─── App State Types ─────────────────────────────────────────────────────────

export type AppStep = "upload" | "loading" | "results";

export type LoadingPhase =
  | "extracting"
  | "analyzing"
  | "generating";
