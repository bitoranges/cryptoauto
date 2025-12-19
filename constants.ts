
export const CONFIG_VERSION = "v1.0.1";

export const SOURCE_TIERS: Record<string, number> = {
  OFFICIAL: 1,    // 官方/监管
  TIER1_MEDIA: 2, // 一线媒体 (Coindesk, TheBlock)
  TIER2_MEDIA: 3, // 二线媒体/社区 (Odaily, Foresight)
  COMMUNITY: 4    // X/Telegram/社区传闻
};

export const REJECT_REASONS = [
  "内容重复",
  "可信度低",
  "影响力小",
  "风险过高",
  "不相关",
  "已知信息"
];

export const MOCK_CHART_DATA = [
  { name: '08:00', traffic: 4, research: 1 },
  { name: '10:00', traffic: 7, research: 2 },
  { name: '12:00', traffic: 12, research: 3 },
  { name: '14:00', traffic: 15, research: 2 },
  { name: '16:00', traffic: 8, research: 5 },
  { name: '18:00', traffic: 6, research: 1 },
];

export const WHITELIST_DOMAINS = {
  OFFICIAL: ["binance.com", "okx.com", "sec.gov", "ethereum.org", "solana.com"],
  TIER1: ["coindesk.com", "theblock.co", "reuters.com", "bloomberg.com"],
  TIER2: ["odaily.news", "foresightnews.pro", "panewslab.com"]
};
