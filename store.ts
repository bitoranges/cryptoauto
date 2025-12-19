
import { Signal, Draft, Story, Domain, SignalType, Lane, Track, PublishLevel, VerificationStatus, DraftStatus, SignalMaturity } from './types';
import { CONFIG_VERSION } from './constants';

interface AppState {
  signals: Signal[];
  drafts: Draft[];
  stories: Story[];
}

const STORAGE_KEY = 'xagentic_state';

const mockSignals: Signal[] = [
  {
    signal_id: 'sig_1',
    story_id: 'story_1',
    cluster_id: 'cluster_1',
    topic: 'Binance Lists New AI Agent Token',
    domain: Domain.AI_CRYPTO,
    signal_type: SignalType.EVENT,
    // Fix: Added missing maturity property
    maturity: SignalMaturity.MATURED,
    time_sensitivity: 'high',
    discussion_level: 'high',
    entities: ['Binance', 'AIAgent', 'Solana'],
    claims: [
      { claim_id: 'c1', claim_text: 'Trading starts at 12:00 UTC', claim_type: 'data', entities: ['Binance'], verifiability: 'verifiable', status: VerificationStatus.CONFIRMED }
    ],
    evidence: [
      // Fix: source_tier must be "1" | "2" | "3" | "4". '1' represents Official.
      { evidence_id: 'e1', url: 'https://binance.com/announcement', source_tier: '1', title: 'New Listing', snippet: 'AIAgent (AIA) listing details...', captured_at: new Date().toISOString() }
    ],
    verdict: {
      status: VerificationStatus.CONFIRMED,
      confidence: 0.98,
      supporting_sources: ['https://binance.com/announcement'],
      contradictions: [],
      what_would_confirm: []
    },
    // Added risk_score property to satisfy Signal interface
    routing: { lane: Lane.FAST, track: Track.TRAFFIC, publish_level: PublishLevel.SEMI, risk_score: 10, required_labels: ['Official'], risk_notes: [] },
    scores: { novelty: 90, credibility: 100, discussion: 85, impact: 95, total: 92 },
    created_at: new Date().toISOString(),
    // Added missing config_version to satisfy Signal interface
    config_version: CONFIG_VERSION
  },
  {
    signal_id: 'sig_2',
    story_id: 'story_2',
    cluster_id: 'cluster_2',
    topic: 'Ethereum L2 Transaction Spike Analysis',
    domain: Domain.CRYPTO,
    signal_type: SignalType.DATA,
    // Fix: Added missing maturity property
    maturity: SignalMaturity.DEVELOPING,
    time_sensitivity: 'medium',
    discussion_level: 'medium',
    entities: ['Ethereum', 'Base', 'L2'],
    claims: [],
    evidence: [],
    verdict: { status: VerificationStatus.PARTIAL, confidence: 0.7, supporting_sources: [], contradictions: [], what_would_confirm: ['On-chain verification'] },
    // Added risk_score property to satisfy Signal interface
    routing: { lane: Lane.SLOW, track: Track.RESEARCH, publish_level: PublishLevel.MANUAL, risk_score: 25, required_labels: ['Deep Dive'], risk_notes: [] },
    scores: { novelty: 60, credibility: 80, discussion: 40, impact: 70, total: 62 },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    // Added missing config_version to satisfy Signal interface
    config_version: CONFIG_VERSION
  }
];

const mockDrafts: Draft[] = [
  {
    draft_id: 'd_1',
    signal_id: 'sig_1',
    track: Track.TRAFFIC,
    status: DraftStatus.DRAFT,
    content: '🚨 New Listing: Binance adds $AIAgent. Trading starts 12:00 UTC. Massive liquidity influx expected for Solana AI ecosystem.',
    labels: ['Confirmed', 'Listing'],
    // Added audit_log to fix property missing error
    audit_log: [],
    // Added regeneration_count to satisfy Draft interface
    regeneration_count: 0,
    created_at: new Date().toISOString(),
    // Added missing config_version to satisfy Draft interface
    config_version: CONFIG_VERSION
  },
  {
    draft_id: 'd_2',
    signal_id: 'sig_2',
    track: Track.RESEARCH,
    status: DraftStatus.NEEDS_MORE_EVIDENCE,
    content: 'Ethereum L2 activity is decoupling from L1 costs. Data shows Base transaction volume exceeding L1, but where is the value capture?',
    counter_case: 'L2 activity might be heavily driven by sybil/bot interactions rather than organic growth.',
    labels: ['On-chain', 'Research'],
    // Added audit_log to fix property missing error
    audit_log: [],
    // Added regeneration_count to satisfy Draft interface
    regeneration_count: 0,
    created_at: new Date().toISOString(),
    // Added missing config_version to satisfy Draft interface
    config_version: CONFIG_VERSION
  }
];

const mockStories: Story[] = [
  {
    story_id: 'story_1',
    title: 'AIAgent Token Ecosystem Launch',
    status: 'monitoring',
    signals: ['sig_1'],
    // Fix: Added missing maturity property
    maturity: SignalMaturity.MATURED,
    summary: 'Ongoing launch tracking for AIAgent ecosystem across multiple chains.',
    latest_update_at: new Date().toISOString()
  },
  {
    story_id: 'story_2',
    title: 'Ethereum L2 Scalability Trends 2024',
    status: 'new',
    signals: ['sig_2'],
    // Fix: Added missing maturity property
    maturity: SignalMaturity.DEVELOPING,
    summary: 'Macro view on L2 efficiency and data availability adoption.',
    latest_update_at: new Date().toISOString()
  }
];

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return { signals: mockSignals, drafts: mockDrafts, stories: mockStories };
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
