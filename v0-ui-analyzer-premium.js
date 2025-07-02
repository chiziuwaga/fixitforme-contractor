import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { program } from 'commander';

// --- CONFIGURATION ---
const V0_API_KEY = process.env.V0_API_KEY || 'v1:team_E3Mreo09jAdwrimR6tp6MK3Z:hGjVakAx1dk9b26iFV4fHtSg';
const V0_API_BASE = 'https://api.v0.dev/v1/chat/completions';

const V0_CONFIG = {
  model: 'v0-1.5-lg',
  temperature: 0.6,
  max_tokens: 4000,
};

const MASTER_SYSTEM_PROMPT = `
You are an elite UI/UX designer specializing in premium business applications for professional contractors. Create sophisticated, animated, and visually stunning React components that embody the "gold standard" of trade technology.

## FixItForMe Brand Excellence Standards

### 🎨 Visual Design Requirements
- **Felix Gold (#D4A574)**: Premium primary actions, highlights, "gold standard" elements
- **Forest Green (#1A2E1A)**: Professional text, secondary actions, stability
- **Glass Morphism**: Subtle backdrop blur, premium transparency effects
- **Micro-animations**: Smooth hover states, loading transitions, success celebrations
- **Professional Polish**: Consistent 8px spacing grid, premium shadows, crisp typography

### 🎯 Contractor-Focused UX Patterns
- **Desktop-First**: Optimized for 1024px+ screens with professional layouts
- **Chat-Centric**: 70% chat window prominence for agent interactions
- **Data-Rich**: Professional tables, charts, and metrics displays
- **Action-Oriented**: Clear CTAs, progress indicators, status management
- **Trust-Building**: Security indicators, professional credentials, quality badges

### 🚀 Technical Excellence Requirements
- **Semantic Classes ONLY**: bg-primary, text-secondary, border-accent (NO hardcoded colors)
- **Framer Motion**: Smooth animations with professional easing curves
- **Accessibility**: ARIA labels, focus management, keyboard navigation
- **TypeScript**: Strict typing with comprehensive prop interfaces
- **Performance**: Optimized animations, lazy loading, efficient re-renders

### 🎭 Animation & Polish Standards
- **Hover Effects**: scale(1.02), translateY(-2px), enhanced shadows
- **Loading States**: Sophisticated skeletons, progress indicators, smooth transitions
- **Success States**: Celebration animations, check marks, positive feedback
- **Error Handling**: Graceful error states with helpful messaging
- **Responsive**: Smooth breakpoint transitions, mobile-aware interactions

Return ONLY production-ready React/TypeScript code that exceeds professional standards.
`;

class V0PremiumAnalyzer {
  constructor() {
    if (!V0_API_KEY) {
      throw new Error('V0_API_KEY is not set. Please set it in your environment variables.');
    }
    this.headers = {
      'Authorization': `Bearer ${V0_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  createPrompt(componentName, currentCode, context) {
    return `
Component to improve: **${componentName}**

${context ? `**Context:** ${context}` : ''}

**Current Code:**
\`\`\`tsx
${currentCode}
\`\`\`

**Task:**
Rewrite and enhance this component to meet the FixItForMe Brand Excellence Standards. Ensure all technical, visual, and UX requirements from the system prompt are met. Return only the complete, production-ready tsx code block.
`;
  }

  async improveComponent(filePath, context) {
    const componentName = path.basename(filePath);
    console.log(`\\n🔄 [Phase 1] Analyzing ${componentName} with Premium v0.dev settings...`);

    let currentCode;
    try {
      currentCode = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error.message);
      return;
    }

    const prompt = this.createPrompt(componentName, currentCode, context);

    try {
      const response = await fetch(V0_API_BASE, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          ...V0_CONFIG,
          messages: [
            { role: 'system', content: MASTER_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      const responseContent = result.choices[0].message.content;
      const codeMatch = responseContent.match(/```(?:tsx|jsx)\\r?\\n([\\s\\S]*?)\\r?\\n```/);
      const improvedCode = codeMatch ? codeMatch[1] : responseContent.trim();

      if (!improvedCode) {
        console.error('❌ No code block found in v0.dev response.');
        console.log('Raw response:', responseContent);
        return;
      }

      this.writeComponent(filePath, currentCode, improvedCode);

    } catch (error) {
      console.error(`❌ Error improving ${componentName}:`, error);
    }
  }

  writeComponent(filePath, originalCode, improvedCode) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, originalCode);
    console.log(`💾 Backup created: ${path.basename(backupPath)}`);

    fs.writeFileSync(filePath, improvedCode);
    console.log(`✅ Successfully enhanced and updated: ${filePath}`);
  }
}

async function main() {
  program
    .option('--component <path>', 'Path to the component to improve')
    .option('--context <text>', 'Additional context for the improvement')
    .parse(process.argv);

  const options = program.opts();

  if (!options.component) {
    console.error('Error: --component <path> is required.');
    process.exit(1);
  }

  const analyzer = new V0PremiumAnalyzer();
  await analyzer.improveComponent(options.component, options.context || '');
}

main().catch(console.error);
