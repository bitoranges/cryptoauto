
export enum Domain {
  CRYPTO = 'Crypto',
  AI = 'AI',
  AI_CRYPTO = 'AI+Crypto'
}

export enum SignalType {
  RUMOR = 'rumor',
  EVENT = 'event',
  NARRATIVE = 'narrative',
  DATA = 'data'
}

export enum Lane {
  FAST = 'fast',
  SLOW = 'slow'
}

export enum Track {
  TRAFFIC = 'traffic',
  RESEARCH = 'research'
}

export enum PublishLevel {
  AUTO = 'auto',
  SEMI = 'semi',
  MANUAL = 'manual'
}

export enum VerificationStatus {
  CONFIRMED = 'confirmed',
  PARTIAL = 'partial',
  UNCONFIRMED = 'unconfirmed',
  FALSE = 'false'
}

export enum SignalMaturity {
  RUMOR = 'rumor',
  DEVELOPING = 'developing',
  MATURED = 'matured',
  STALE = 'stale'
}

export enum DraftStatus {
  DRAFT = 'draft',
  NEEDS_MORE_EVIDENCE = 'needs_more_evidence',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published'
}

export enum Stance {
  BULLISH = 'bullish',
  BEARISH = 'bearish',
  NEUTRAL = 'neutral',
  CHAOS = 'chaos'
}

export enum SystemMode {
  NORMAL = 'Normal',
  HIGH_ACTIVITY = 'High Activity',
  DEGRADED = 'Degraded'
}

export interface ReviewAudit {
  action: 'approve' | 'reject' | 'edit' | 'merge' | 'split' | 'correct' | 'regenerate' | 'checkpoint' | 'publish_link';
  reason?: string;
  feedback?: string;
  timestamp: string;
}

export interface GroundingChunk {
  source_id?: string;
  text: string;
  relevance: number;
  uri?: string;
  title?: string;
}

export interface Claim {
  claim_id: string;
  claim_text: string;
  claim_type: 'event' | 'data' | 'quote';
  entities: string[];
  verifiability: 'verifiable' | 'unverifiable';
  status: VerificationStatus;
  grounding_support?: string; 
  manual_verified?: boolean;
}

export interface Evidence {
  evidence_id: string;
  url: string;
  source_tier: "1" | "2" | "3" | "4"; // 1:Official, 2:Tier1, 3:Tier2, 4:Community
  title: string;
  snippet: string;
  captured_at: string;
  starred?: boolean;
}

export interface AnalysisOutput {
  key_changes: string;
  market_impact: string;
  narrative_impact: string;
  affected_assets: string[];
  stance: Stance;
  stance_reasoning?: string;
  recommended_action?: string;
  alpha_score?: number;
  narrative_affinity?: number;
  what_would_change_mind?: string; 
}

export interface EngagementMetrics {
  impressions: number;
  likes: number;
  retweets: number;
  bookmarks: number;
}

export interface Signal {
  signal_id: string;
  story_id: string;
  cluster_id: string;
  topic: string;
  domain: Domain;
  sub_sector?: string;
  signal_type: SignalType;
  maturity: SignalMaturity;
  time_sensitivity: 'low' | 'medium' | 'high';
  discussion_level: 'low' | 'medium' | 'high';
  entities: string[];
  claims: Claim[];
  evidence: Evidence[];
  grounding_chunks?: GroundingChunk[];
  analysis_output?: AnalysisOutput;
  discovery_consensus?: {
    grok: boolean;
    gpt: boolean;
    gemini: boolean;
    score: number;
    sources: string[];
  };
  agent_reasoning?: {
    classifier?: string;
    verifier?: string;
    analyst?: string;
    judge?: string;
  };
  consensus_conflict?: {
    is_conflicted: boolean;
    reason: string;
    severity: 'low' | 'critical';
  };
  narrative_drift?: {
    is_drifting: boolean;
    previous_stance?: Stance;
    divergence_score: number; 
  };
  verdict: {
    status: VerificationStatus;
    confidence: number;
    supporting_sources: string[];
    contradictions: string[];
    what_would_confirm: string[];
  };
  routing: {
    lane: Lane;
    track: Track;
    publish_level: PublishLevel;
    risk_score: number;
    required_labels: string[];
    risk_notes: string[];
    projected_reach?: 'low' | 'medium' | 'high' | 'viral';
    agent_debate?: string;
  };
  scores: {
    novelty: number;
    credibility: number;
    discussion: number;
    impact: number;
    total: number;
  };
  audio_brief_url?: string;
  created_at: string;
  config_version: string; 
}

export interface Draft {
  draft_id: string;
  signal_id: string;
  track: Track;
  status: DraftStatus;
  content: string;
  labels: string[];
  counter_case?: string;
  fact_checksum?: string;
  thread_items?: string[];
  audit_log: ReviewAudit[];
  regeneration_count: number;
  performance?: EngagementMetrics;
  tweet_url?: string;
  published_at?: string;
  created_at: string;
  config_version: string;
}

export interface Story {
  story_id: string;
  title: string;
  status: 'new' | 'monitoring' | 'published' | 'archived' | 'retracted';
  signals: string[];
  maturity: SignalMaturity;
  summary: string;
  distilled_note?: string;
  poster_url?: string; 
  video_url?: string;
  is_generating_video?: boolean;
  latest_update_at: string;
}

export interface CalibrationState {
  impact_threshold: number;
  credibility_bias: number;
  last_calibrated_at: string;
  adjustment_log: { type: string; delta: string; timestamp: string }[];
}

export interface NodeMetric {
  node: string;
  latency: number;
  success: boolean;
  cost?: number;
}

export interface SystemMetric {
  latency: number;
  success_rate: number;
  tokens_used: number;
  estimated_cost: number;
  timestamp: string;
  node_breakdown?: NodeMetric[];
  queue_backlog?: number;
  calibration?: CalibrationState;
  system_mode?: SystemMode;
  staleness_rate?: number;
  system_health?: number; 
  error_rate?: number; 
  throughput?: number; 
}

export interface TaskState {
  id: string;
  label: string;
  interval: number;
  next_run: string;
  status: 'idle' | 'running' | 'boosted' | 'degraded';
}
