# 🎯 ASCII VISUAL ARCHITECTURE

## **Main Interface Layout**

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           FixItForMe Unified Chat Interface                             │
├─────────────────┬───────────────────────────────────────────────────────────────────────┤
│   SIDEBAR       │                    MAIN CHAT AREA                                    │
│   (320px)       │                     (Flexible)                                       │
│                 │                                                                       │
│ ┌─────────────┐ │ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ AI AGENTS   │ │ │                      CHAT HEADER                                  │ │
│ └─────────────┘ │ │  💫 Lexi the Liaison        [Online]    [⚡][⊞][⋯]               │ │
│                 │ └───────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────┐ │                                                                       │
│ │💫 Lexi      │ │ ┌───────────────────────────────────────────────────────────────────┐ │
│ │  Onboarding │ │ │                                                                   │ │
│ │  & Support  │ │ │                     MESSAGES AREA                                 │ │
│ │   [ACTIVE]  │ │ │                    (Scrollable)                                   │ │
│ └─────────────┘ │ │                                                                   │ │
│                 │ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ ┌─────────────┐ │ │  │ User: "Help me understand Scale tier benefits"            │ │ │
│ │📊 Alex      │ │ │  │                                                  [2:34 PM] │ │ │
│ │  Cost Analysis│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │  & Bidding  │ │ │                                                                   │ │
│ │  [SCALE]    │ │ │ ┌─💫─────────────────────────────────────────────────────────────┐ │ │
│ └─────────────┘ │ │ │ Lexi: "Great question! Scale tier includes..."                │ │ │
│                 │ │ │                                                                │ │ │
│ ┌─────────────┐ │ │ │ ┌─────────────────────────────────────────────────────────┐   │ │ │
│ │🔍 Rex       │ │ │ │ │            UPGRADE PROMPT COMPONENT                     │   │ │ │
│ │  Lead Gen   │ │ │ │ │  🎯 Scale Tier Features:                               │   │ │ │
│ │  & Research │ │ │ │ │  ✅ Advanced Cost Analysis with Alex                    │   │ │ │
│ │  [SCALE]    │ │ │ │ │  ✅ AI Lead Generation with Rex                        │   │ │ │
│ └─────────────┘ │ │ │ │  ✅ Priority Support & Custom Integrations             │   │ │ │
│                 │ │ │ │  [🚀 Upgrade to Scale - $250/month] [📚 Learn More]   │   │ │ │
│ ━━━━━━━━━━━━━━━ │ │ │ └─────────────────────────────────────────────────────────┘   │ │ │
│                 │ │ │                                                 [2:34 PM] │ │ │
│ CONVERSATIONS   │ │ └─────────────────────────────────────────────────────────────┘ │ │
│                 │ │                                                                   │ │
│ ┌─────────────┐ │ │ ┌─💫─────────────────────────────────────────────────────────────┐ │ │
│ │📄 Today     │ │ │ │ Follow-up suggestions:                                         │ │ │
│ │  Onboarding │ │ │ │ [📋 Continue Onboarding] [💎 Scale Benefits] [📞 Book Demo]   │ │ │
│ │  Questions  │ │ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │  [5 msgs]   │ │ │                                                   [2:35 PM] │ │ │
│ └─────────────┘ │ │                                                                   │ │
│                 │ │ ┌───────────────────────────────────────────────────────────────┐ │ │
│ ┌─────────────┐ │ │ │                    ● ● ●                                      │ │ │
│ │🔧 Yesterday │ │ │ │              Lexi is typing...                                │ │ │
│ │  Profile    │ │ │ └───────────────────────────────────────────────────────────────┘ │ │
│ │  Setup Help │ │ │                                                                   │ │
│ │  [3 msgs]   │ │ └───────────────────────────────────────────────────────────────────┘ │
│ └─────────────┘ │                                                                       │
│                 │ ┌───────────────────────────────────────────────────────────────────┐ │
│ ┌─────────────┐ │ │                     INPUT SECTION                                 │ │
│ │💰 Last Week │ │ │                                                                   │ │
│ │  Pricing    │ │ │ Quick Actions:                                                    │ │
│ │  Questions  │ │ │ [📋 Continue Onboarding] [💎 Scale Tier Info]                     │ │
│ │  [8 msgs]   │ │ │                                                                   │ │
│ └─────────────┘ │ │ ┌─────────────────────────────────────────────────────────┐ [🚀] │ │
│                 │ │ │ Message Lexi the Liaison...                             │     │ │
│ [+ New Thread]  │ │ └─────────────────────────────────────────────────────────┘     │ │
│                 │ └───────────────────────────────────────────────────────────────────┘ │
└─────────────────┴───────────────────────────────────────────────────────────────────────┘
```

## **Agent Switching Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  💫 LEXI        │    │  📊 ALEX        │    │  🔍 REX         │
│  Felix Gold     │    │  Success Green  │    │  Forest Green   │
│  (Primary)      │    │  (Scale Only)   │    │  (Scale Only)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ONBOARDING      │    │ COST ANALYSIS   │    │ LEAD GENERATION │
│ • Welcome Flow  │    │ • Material Calc │    │ • Market Research│
│ • Platform Tour │    │ • Timeline Est  │    │ • Lead Scoring  │
│ • Tier Upgrades │    │ • Competitive   │    │ • Opportunity   │
│ • Support Help  │    │   Analysis      │    │   Discovery     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## **Message Flow Architecture**

```
USER INPUT
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    handleSendMessage()                      │
│  1. Create user message object                              │
│  2. Add to messages state                                   │
│  3. Clear input field                                       │
│  4. Set loading state                                       │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│              API Call to /api/agents/{agent}                │
│  POST: { messages, threadId, contractor_id }               │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    STREAMING RESPONSE                       │
│                                                             │
│  data: {"content": "Hello! I'm Lexi..."}                  │
│  data: {"content": " and I'm here to help"}               │
│  data: {"ui_assets": {...}, "actions": [...]}             │
│  data: {"follow_up_prompts": ["...", "..."]}              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                  REAL-TIME UI UPDATES                      │
│                                                             │
│  1. Streaming text → Update message content                │
│  2. UI assets → Render dynamic components                  │
│  3. Actions → Show interactive buttons                     │
│  4. Follow-ups → Display suggestion chips                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE PERSISTENCE                      │
│                                                             │
│  • chat_messages: Core message data                        │
│  • chat_message_ui_assets: Dynamic components              │
│  • chat_followup_prompts: Suggestion context               │
│  • chat_threads: Conversation metadata                     │
└─────────────────────────────────────────────────────────────┘
```

## **Responsive Behavior**

```
DESKTOP (>= 768px)                    MOBILE (< 768px)
┌─────────────┬─────────────┐        ┌─────────────────────┐
│  SIDEBAR    │    CHAT     │        │    MOBILE CHAT      │
│  (320px)    │ (Flexible)  │   →    │    (Full Width)     │
│             │             │        │                     │
│ • Agents    │ • Header    │        │ [☰] Header [⚡]     │
│ • Threads   │ • Messages  │        │                     │
│ • User Menu │ • Input     │        │ Messages (Full)     │
└─────────────┴─────────────┘        │                     │
                                     │ Input (Full)        │
                                     │                     │
                                     │ [Drawer: Threads]   │
                                     └─────────────────────┘

MINIMIZED MODE (All Screens)
┌─────┐
│ 💬  │ ← Floating Action Button
└─────┘   (Bottom Right)
```

## **UI Asset Rendering System**

```
AGENT RESPONSE WITH UI ASSETS
│
▼
┌─────────────────────────────────────────────────────────────┐
│                  renderUIAssets()                           │
│                                                             │
│  switch (ui_assets.type) {                                 │
│    case 'alex_cost_breakdown':                             │
│      return <AlexCostBreakdown data={data} />             │
│    case 'rex_lead_dashboard':                              │
│      return <RexLeadDashboard data={data} />              │
│    case 'lexi_onboarding':                                 │
│      return <LexiOnboarding data={data} />                │
│    case 'upgrade_prompt':                                  │
│      return <UpgradePrompt data={data} />                 │
│  }                                                         │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│            DYNAMIC COMPONENT EXAMPLES                      │
│                                                             │
│  🏗️ ALEX COST BREAKDOWN                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Materials: $2,450                                   │   │
│  │ Labor:     $3,200                                   │   │
│  │ Permits:   $450                                     │   │
│  │ ────────────────                                   │   │
│  │ Total:     $6,100                                   │   │
│  │                                                     │   │
│  │ [📊 View Timeline] [📋 Export PDF]                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🔍 REX LEAD DASHBOARD                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📍 Kitchen Remodel - $15K Budget                   │   │
│  │ 📅 Posted: 2 hours ago                             │   │
│  │ 📞 Contact: Sarah M. (Verified)                    │   │
│  │ 🎯 Match Score: 94%                                │   │
│  │                                                     │   │
│  │ [📞 Contact Now] [📋 Save Lead] [🔍 More Info]    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---
