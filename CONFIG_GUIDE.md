
# XAgentic 系统配置指南 (Config Guide)

## 0. 核心原则
系统采用“自适应反馈”机制。Owner 的每一项 **Approve/Reject** 动作都会反哺给系统的权重模型。

---

## 1. 神经自适应参数 (Calibration)

### 1.1 影响力过滤门槛 (Impact Threshold)
*   **路径**: `设置 -> 神经校准 -> 影响力过滤门槛`
*   **逻辑**: 对 `Analyst` 产出的 `alpha_score` (0-100) 进行硬性截断。
*   **建议**: 
    *   **低噪声模式 (80+)**: 只看真正的 Breaking News。
    *   **Alpha 模式 (40-60)**: 关注叙事早期传闻。

### 1.2 核信度权重偏差 (Credibility Bias)
*   **逻辑**: 增加对“官方源 (Tier 1)”情报的权重奖励。
*   **影响**: 开启后，Binance/SEC 等官方公告会无视低影响力评分，强制进入 `Fast Lane`。

---

## 2. 任务调度逻辑 (Scheduler)

| 任务 ID | 默认间隔 | 作用 | 动态规则 |
| :--- | :--- | :--- | :--- |
| `hot_radar` | 30m | 扫描 X 热点讨论 | 讨论度激增时缩短至 5m |
| `official_feed` | 5m | 抓取官方 RSS/公告 | 始终保持高频探测 |
| `rumor_mill` | 15m | 聚合未证实传闻 | 仅在非静默期运行 |

---

## 3. 发布路由规则 (Routing)

*   **Fast Lane (快车道)**:
    *   条件: 核实状态 = `Confirmed` 且 风险评分 < 20。
    *   行为: 生成草稿后直接置于 `Traffic Pool` 顶部。
*   **Slow Lane (慢车道)**:
    *   条件: 核实状态 = `Partial` 或 涉及复杂叙事。
    *   行为: 触发 `Verifier` 深层搜索，等待人工深度审计。

---

## 4. 人工审核反馈 (HITL Loop)

每次点击 `Reject` 并选择理由时：
1.  **"影响力小"**: 自动增加 `Impact Threshold` 2 点。
2.  **"可信度低"**: 系统会自动降低对应 Source 的 `Weight` 权重。
3.  **"内容重复"**: 强制刷新向量数据库的聚类阈值。

---

## 5. 版本说明
*   **Config Version**: `v1.0.1`
*   **引擎**: Gemini 3 Pro (Inference) / Gemini 3 Flash (Dedupe)
