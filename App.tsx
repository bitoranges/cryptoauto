
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ReviewDesk from './components/ReviewDesk';
import StoriesView from './components/StoriesView';
import PublishedView from './components/PublishedView';
import SettingsView from './components/SettingsView';
import { loadState, saveState } from './store';
import { Signal, Draft, DraftStatus, Story, VerificationStatus, Track, Lane, SystemMetric, TaskState, Stance, CalibrationState, SignalMaturity } from './types';
import { classifySignal, verifyClaims, analyzeImpact, judgeSignal, generatePolishedDraft, getUrlTier, distillStory, validateUrl, generateStoryPoster, supplementalVerification, generateDeepDiveReport } from './services/geminiService';
import { CONFIG_VERSION } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [state, setState] = useState(loadState());
  const [isScanning, setIsScanning] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [systemLogs, setSystemLogs] = useState<{msg: string, ts: string}[]>([]);
  
  const [tasks, setTasks] = useState<TaskState[]>([
    { id: 'hot_radar', label: '热点雷达', interval: 30, next_run: new Date(Date.now() + 30*60000).toISOString(), status: 'idle' },
    { id: 'official_feed', label: '官方公告', interval: 5, next_run: new Date(Date.now() + 5*60000).toISOString(), status: 'idle' },
    { id: 'rumor_mill', label: '传闻工厂', interval: 15, next_run: new Date(Date.now() + 15*60000).toISOString(), status: 'idle' }
  ]);
  
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [calibration, setCalibration] = useState<CalibrationState>({
    impact_threshold: 60,
    credibility_bias: 0.05,
    last_calibrated_at: new Date().toISOString(),
    adjustment_log: []
  });

  const addLog = (msg: string) => {
    setSystemLogs(prev => [{ msg, ts: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }) }, ...prev.slice(0, 49)]);
  };

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    const checkKey = async () => {
      try { 
        const s = await (window as any).aistudio?.hasSelectedApiKey(); 
        setHasKey(s ?? false); 
      } catch { 
        setHasKey(false); 
      }
    };
    checkKey();
  }, []);

  const processRawSignal = async (rawText: string) => {
    if (isScanning) return;
    const startTime = Date.now();
    setIsScanning(true);
    
    addLog(`[采集] 启动源链接校验协议...`);
    const urlMatch = rawText.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const vResult = await validateUrl(urlMatch[0]);
      if (!vResult.valid) {
         addLog(`[预警] ❌ 源链接信度校验失败: ${vResult.reason}`);
      }
    }

    try {
      addLog(`[分析] Classifier 解析语义...`);
      const classification = await classifySignal(rawText);
      
      const matchedStory = state.stories.find(s => 
        s.title.toLowerCase().includes(classification.topic.toLowerCase()) || 
        classification.entities.some(e => s.title.includes(e))
      );

      addLog(`[核验] 并行搜索与立场推演...`);
      const [verification, analysis] = await Promise.all([
        verifyClaims(classification.topic, classification.entities),
        analyzeImpact(classification.topic, rawText, matchedStory?.summary || "")
      ]);

      if (analysis.alpha_score * 10 < calibration.impact_threshold) {
         addLog(`[静默] 强度 (${analysis.alpha_score * 10}) 低于门槛 (${calibration.impact_threshold})`);
      }

      addLog(`[研判] Judge 最终路由决策...`);
      const judgment = await judgeSignal(classification, verification, analysis);

      const signalId = `sig_${Date.now()}`;
      const newSignal: Signal = {
        signal_id: signalId,
        story_id: matchedStory?.story_id || `story_${Date.now()}`,
        cluster_id: `cluster_${Date.now()}`,
        topic: classification.topic,
        domain: classification.domain,
        sub_sector: classification.sub_sector,
        signal_type: classification.signal_type,
        maturity: SignalMaturity.DEVELOPING,
        time_sensitivity: classification.time_sensitivity,
        discussion_level: classification.discussion_level,
        entities: classification.entities,
        claims: [{ claim_id: `cl_${signalId}_0`, claim_text: classification.topic, claim_type: 'event', entities: classification.entities, verifiability: 'verifiable', status: verification.status }],
        evidence: verification.grounding_chunks.map((chunk: any, i: number) => ({
          evidence_id: `ev_${signalId}_${i}`,
          url: chunk.uri || "",
          source_tier: getUrlTier(chunk.uri || "") as any,
          title: chunk.title || "Evidence Snapshot",
          snippet: chunk.text || "",
          captured_at: new Date().toISOString()
        })),
        analysis_output: analysis,
        agent_reasoning: {
          classifier: `归类: ${classification.sub_sector}`,
          verifier: `核实: ${verification.status}`,
          analyst: `强度: ${analysis.alpha_score}`,
          judge: `路由: ${judgment.lane.toUpperCase()}`
        },
        verdict: { status: verification.status, confidence: verification.confidence, supporting_sources: verification.sources, contradictions: [], what_would_confirm: [verification.what_would_confirm] },
        routing: judgment,
        scores: { novelty: 80, credibility: 75, discussion: 85, impact: analysis.alpha_score * 10, total: 80 },
        created_at: new Date().toISOString(),
        config_version: CONFIG_VERSION
      };

      addLog(`[草稿] 文案生成中...`);
      const draftData = await generatePolishedDraft(newSignal, analysis);
      const newDraft: Draft = {
        draft_id: `d_${Date.now()}`,
        signal_id: signalId,
        track: judgment.track,
        status: (analysis.alpha_score * 10 < calibration.impact_threshold) ? DraftStatus.REJECTED : DraftStatus.DRAFT,
        content: draftData.content,
        labels: draftData.labels,
        counter_case: draftData.counter_case,
        fact_checksum: draftData.fact_checksum,
        thread_items: draftData.thread_items,
        regeneration_count: 0,
        audit_log: (analysis.alpha_score * 10 < calibration.impact_threshold) ? [{ action: 'reject', reason: 'Auto Filter', timestamp: new Date().toISOString() } as any] : [],
        created_at: new Date().toISOString(),
        config_version: CONFIG_VERSION
      };

      let posterUrl: string | undefined;
      if (!matchedStory) posterUrl = await generateStoryPoster(classification.topic, analysis.market_impact);

      setState(prev => ({
        ...prev,
        signals: [newSignal, ...prev.signals],
        drafts: [newDraft, ...prev.drafts],
        stories: !matchedStory 
          ? [{ story_id: newSignal.story_id, title: classification.topic, status: 'new', signals: [signalId], summary: analysis.market_impact, maturity: SignalMaturity.DEVELOPING, poster_url: posterUrl, latest_update_at: new Date().toISOString() } as Story, ...prev.stories] 
          : prev.stories.map(s => s.story_id === matchedStory.story_id ? { ...s, signals: [...s.signals, signalId], latest_update_at: new Date().toISOString() } : s)
      }));
      
      addLog(`[就绪] 神经处理完毕 (${Date.now() - startTime}ms)`);
    } catch (e: any) {
      addLog(`[故障] ❌ ${e.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReview = (draftId: string, action: 'approve' | 'reject', reason?: string) => {
    setState(prev => {
      const draft = prev.drafts.find(d => d.draft_id === draftId);
      if (!draft) return prev;
      
      const newDrafts = prev.drafts.map(d => {
        if (d.draft_id === draftId) {
          if (action === 'approve') {
             navigator.clipboard.writeText(d.content);
             addLog(`[部署] 情报已发布。文案已复制。`);
             return { ...d, status: DraftStatus.PUBLISHED, audit_log: [...d.audit_log, { action, timestamp: new Date().toISOString() } as any] };
          }
          return { ...d, status: DraftStatus.REJECTED, audit_log: [...d.audit_log, { action, reason, timestamp: new Date().toISOString() } as any] };
        }
        return d;
      });
      return { ...prev, drafts: newDrafts };
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView signals={state.signals} drafts={state.drafts} metrics={metrics} tasks={tasks} onRetract={(id) => handleReview(id, 'reject', 'Manual Retract')} />;
      case 'signals': return <ReviewDesk signals={state.signals} drafts={state.drafts} stories={state.stories} onReview={handleReview} onEdit={(id, content) => setState(p => ({ ...p, drafts: p.drafts.map(d => d.draft_id === id ? { ...d, content } : d) }))} onUpdateThread={(id, items) => setState(p => ({ ...p, drafts: p.drafts.map(d => d.draft_id === id ? { ...d, thread_items: items } : d) }))} onUpdateCounterCase={(id, cc) => setState(p => ({ ...p, drafts: p.drafts.map(d => d.draft_id === id ? { ...d, counter_case: cc } : d) }))} onToggleStar={(sid, eid) => setState(p => ({ ...p, signals: p.signals.map(s => s.signal_id === sid ? { ...s, evidence: s.evidence.map(e => e.evidence_id === eid ? { ...e, starred: !e.starred } : e) } : s) }))} onAskMoreEvidence={(id, q) => supplementalVerification(state.signals.find(s=>s.signal_id===id)!.topic, q || "").then(() => addLog("补充核验成功"))} onMergeStory={(s, t) => addLog("叙事已归并")} onRegenerate={(id, f) => generatePolishedDraft(state.signals.find(s=>s.signal_id===state.drafts.find(d=>d.draft_id===id)!.signal_id)!, {}, f).then(res => setState(p => ({ ...p, drafts: p.drafts.map(d => d.draft_id === id ? { ...d, ...res, regeneration_count: d.regeneration_count + 1 } : d) })))} onUpdateClaims={(sid, c) => setState(p => ({ ...p, signals: p.signals.map(s => s.signal_id === sid ? { ...s, claims: c } : s) }))} />;
      case 'stories': return <StoriesView stories={state.stories} signals={state.signals} onUpdateSummary={(id, s) => setState(p => ({ ...p, stories