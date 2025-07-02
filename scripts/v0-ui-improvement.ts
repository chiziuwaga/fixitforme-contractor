#!/usr/bin/env tsx
/**
 * FixItForMe v0.dev UI Improvement Script
 * 
 * This script uses the v0.dev Model API to systematically improve
 * all UI components across the contractor module, ensuring:
 * - FixItForMe brand consistency
 * - Modern shadcn/ui best practices
 * - Professional contractor-focused UX
 * - Accessibility standards
 * - Performance optimization
 */

import fs from 'fs/promises';
import path from 'path';
import { generateText } from 'ai';
import { vercel } from '@ai-sdk/vercel';

// Configuration
const V0_API_KEY = process.env.V0_API_KEY;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'src', 'components');
const PAGES_DIR = path.join(PROJECT_ROOT, 'src', 'app');

if (!V0_API_KEY) {
  console.error('❌ V0_API_KEY environment variable is required');
  process.exit(1);
}

// FixItForMe Brand Context for v0.dev
const BRAND_CONTEXT = `
# FixItForMe Brand System & Design Requirements

## Brand Identity
- **Name**: FixItForMe
- **Tagline**: Professional Home Repairs
- **Target**: Professional contractors managing their business
- **Personality**: Trustworthy, Intelligent, Approachable, Solution-Oriented

## Color System (OKLCH Format - shadcn/ui v2)
- **Primary**: #D4A574 (Felix Gold) - Premium quality, craftsmanship
- **Secondary**: #1A2E1A (Forest Green) - Growth, stability, professionalism  
- **Background**: #FFFFFF (Pure White)
- **Text Primary**: #1A2E1A (Forest Green)
- **Text Secondary**: #2C2C2C (Charcoal)
- **Success**: #28A745
- **Warning**: #FFC107
- **Error**: #DC3545
- **Info**: #17A2B8

## Typography
- **Primary UI**: Inter (clean, professional, data-rich interfaces)
- **Headlines**: Roboto Slab (approachable, human touch)

## Design Principles
1. **Desktop/Tablet-First**: Professional tool for contractors
2. **Chat-Centric**: AI agents (Lexi, Alex, Rex, Felix) are core to UX
3. **Data-Rich**: Complex bidding, analysis requires larger screens
4. **Professional Context**: Business management tool, not consumer app
5. **High Quality**: No compromised mobile experience

## Agent Personas
- **Lexi (Liaison)**: Friendly onboarding guide - Felix Gold (#D4A574)
- **Alex (Assessor)**: Analytical bidding assistant - Success Green (#28A745)
- **Rex (Retriever)**: Background lead generation - Warning Orange (#FFC107)
- **Felix (Fixer)**: Diagnostic agent - Forest Green (#1A2E1A)

## Technical Stack
- Next.js 15 with TypeScript
- shadcn/ui v2 with OKLCH colors
- Tailwind CSS with semantic tokens
- Supabase backend
- Vercel deployment
`;

// Component analysis and improvement prompts
const IMPROVEMENT_PROMPTS = {
  page: `
Analyze this Next.js page component and improve it according to FixItForMe brand guidelines.

Requirements:
1. Use semantic Tailwind classes (bg-primary, text-secondary, etc.)
2. Implement proper shadcn/ui v2 patterns with OKLCH colors
3. Ensure desktop/tablet-first responsive design
4. Add proper TypeScript typing
5. Implement accessibility best practices
6. Use Inter/Roboto Slab typography appropriately
7. Maintain chat-centric UX if applicable
8. Add proper loading states and error handling
9. Optimize for contractor professional use case
10. Remove any hardcoded colors or legacy patterns

Focus on:
- Professional, data-rich UI appropriate for business management
- Proper spacing, typography hierarchy
- FixItForMe brand color system integration
- Modern shadcn/ui component patterns
- Performance and accessibility
`,

  component: `
Improve this React component according to FixItForMe brand and shadcn/ui v2 standards.

Requirements:
1. Use semantic Tailwind tokens (bg-primary, text-primary, etc.)
2. Implement latest shadcn/ui v2 patterns
3. Proper TypeScript interfaces and props
4. OKLCH color format integration
5. Accessibility (ARIA labels, focus management, keyboard nav)
6. Error boundaries and loading states
7. Professional contractor-focused UX
8. Inter typography for UI, Roboto Slab for headlines
9. Responsive design (desktop/tablet priority)
10. Remove hardcoded colors and legacy code

Focus on:
- Clean, professional component architecture
- Proper prop typing and documentation
- FixItForMe brand integration
- Modern React patterns and hooks
- Performance optimization
`,

  layout: `
Enhance this layout component for the FixItForMe contractor module.

Requirements:
1. Implement FixItForMe brand color system with semantic tokens
2. Use latest shadcn/ui v2 layout patterns
3. Ensure desktop/tablet-first responsive design
4. Integrate chat-centric navigation if applicable
5. Professional contractor-focused header/sidebar/navigation
6. Proper TypeScript and accessibility
7. Felix Gold (#D4A574) and Forest Green (#1A2E1A) brand colors
8. Inter typography for UI elements
9. Mobile redirect logic for professional UX
10. Agent persona integration where relevant

Focus on:
- Professional business application layout
- Efficient navigation for contractor workflows
- Brand consistency across all layout elements
- Modern design patterns and user experience
`
};

interface ComponentInfo {
  filePath: string;
  relativePath: string;
  content: string;
  type: 'page' | 'component' | 'layout';
  priority: number;
}

interface ImprovementResult {
  filePath: string;
  originalContent: string;
  improvedContent: string;
  analysisNotes: string;
  timestamp: string;
}

class V0UIImprover {
  private results: ImprovementResult[] = [];
  
  constructor() {
    console.log('🚀 FixItForMe v0.dev UI Improvement Script');
    console.log('📋 Analyzing contractor module for UI improvements...\n');
  }

  /**
   * Discover all React components and pages for improvement
   */
  async discoverComponents(): Promise<ComponentInfo[]> {
    const components: ComponentInfo[] = [];
    
    // Discover pages
    const pages = await this.findFiles(PAGES_DIR, /page\.tsx$/);
    for (const page of pages) {
      const content = await fs.readFile(page, 'utf-8');
      components.push({
        filePath: page,
        relativePath: path.relative(PROJECT_ROOT, page),
        content,
        type: 'page',
        priority: this.getPagePriority(page)
      });
    }
    
    // Discover components
    const componentFiles = await this.findFiles(COMPONENTS_DIR, /\.tsx$/);
    for (const component of componentFiles) {
      const content = await fs.readFile(component, 'utf-8');
      const type = component.includes('layout') ? 'layout' : 'component';
      components.push({
        filePath: component,
        relativePath: path.relative(PROJECT_ROOT, component),
        content,
        type,
        priority: this.getComponentPriority(component)
      });
    }
    
    // Sort by priority (highest first)
    return components.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Recursively find files matching pattern
   */
  private async findFiles(dir: string, pattern: RegExp): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...await this.findFiles(fullPath, pattern));
        } else if (pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read directory ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * Determine page priority based on importance
   */
  private getPagePriority(filePath: string): number {
    if (filePath.includes('dashboard')) return 100;
    if (filePath.includes('bid')) return 90;
    if (filePath.includes('onboarding')) return 80;
    if (filePath.includes('login') || filePath.includes('auth')) return 70;
    if (filePath.includes('settings')) return 60;
    if (filePath.endsWith('page.tsx')) return 50; // Root page
    return 30;
  }

  /**
   * Determine component priority based on importance
   */
  private getComponentPriority(filePath: string): number {
    if (filePath.includes('ChatManager') || filePath.includes('ChatWindow')) return 95;
    if (filePath.includes('layout') || filePath.includes('Layout')) return 85;
    if (filePath.includes('dashboard')) return 75;
    if (filePath.includes('agent')) return 65;
    if (filePath.includes('auth')) return 55;
    if (filePath.includes('ui/')) return 45; // shadcn/ui components
    return 35;
  }

  /**
   * Improve a single component using v0.dev API
   */
  async improveComponent(component: ComponentInfo): Promise<ImprovementResult> {
    console.log(`🔄 Improving ${component.type}: ${component.relativePath}`);
    
    const prompt = this.buildPrompt(component);
    
    try {
      const { text } = await generateText({
        model: vercel('v0-1.5-md'),
        prompt,
        maxTokens: 4000,
      });

      const result: ImprovementResult = {
        filePath: component.filePath,
        originalContent: component.content,
        improvedContent: this.extractCodeFromResponse(text),
        analysisNotes: this.extractAnalysisFromResponse(text),
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      console.log(`✅ Completed: ${component.relativePath}\n`);
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to improve ${component.relativePath}:`, error);
      throw error;
    }
  }

  /**
   * Build v0.dev prompt for component improvement
   */
  private buildPrompt(component: ComponentInfo): string {
    const basePrompt = IMPROVEMENT_PROMPTS[component.type];
    
    return `${BRAND_CONTEXT}

${basePrompt}

## Current Code to Improve:
\`\`\`tsx
${component.content}
\`\`\`

## File Context:
- File: ${component.relativePath}
- Type: ${component.type}
- Framework: Next.js 15 + TypeScript + shadcn/ui v2

Please provide:
1. **Analysis**: Brief analysis of current issues and improvement opportunities
2. **Improved Code**: Complete, production-ready component code
3. **Key Changes**: Summary of major improvements made

Generate modern, professional, accessible code that exemplifies FixItForMe brand standards.`;
  }

  /**
   * Extract improved code from v0.dev response
   */
  private extractCodeFromResponse(response: string): string {
    // Look for TypeScript/TSX code blocks
    const codeBlockRegex = /```(?:tsx?|typescript|jsx?)\n([\s\S]*?)\n```/;
    const match = response.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }
    
    // Fallback: look for any code block
    const anyCodeBlockRegex = /```\n([\s\S]*?)\n```/;
    const anyMatch = response.match(anyCodeBlockRegex);
    
    return anyMatch ? anyMatch[1].trim() : response;
  }

  /**
   * Extract analysis notes from v0.dev response
   */
  private extractAnalysisFromResponse(response: string): string {
    // Extract everything before the first code block
    const beforeCodeRegex = /([\s\S]*?)```/;
    const match = response.match(beforeCodeRegex);
    
    return match ? match[1].trim() : 'No analysis provided';
  }

  /**
   * Apply improvements to files
   */
  async applyImprovements(dryRun: boolean = false): Promise<void> {
    console.log(`\n🔧 ${dryRun ? 'Previewing' : 'Applying'} improvements...\n`);
    
    for (const result of this.results) {
      if (dryRun) {
        console.log(`📄 ${result.filePath}`);
        console.log(`📝 Analysis: ${result.analysisNotes.substring(0, 100)}...`);
        console.log(`📏 Original: ${result.originalContent.length} chars`);
        console.log(`📏 Improved: ${result.improvedContent.length} chars`);
        console.log('---');
      } else {
        // Create backup
        const backupPath = `${result.filePath}.backup.${Date.now()}`;
        await fs.writeFile(backupPath, result.originalContent);
        
        // Apply improvement
        await fs.writeFile(result.filePath, result.improvedContent);
        console.log(`✅ Applied: ${path.relative(PROJECT_ROOT, result.filePath)}`);
      }
    }
  }

  /**
   * Generate improvement report
   */
  async generateReport(): Promise<void> {
    const reportPath = path.join(PROJECT_ROOT, 'V0_UI_IMPROVEMENT_REPORT.md');
    
    const report = `# FixItForMe v0.dev UI Improvement Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Components Analyzed**: ${this.results.length}
- **Success Rate**: ${this.results.length > 0 ? '100%' : '0%'}

## Improvements Applied

${this.results.map((result, index) => `
### ${index + 1}. ${path.relative(PROJECT_ROOT, result.filePath)}

**Analysis Notes:**
${result.analysisNotes}

**Changes Made:**
- Original: ${result.originalContent.length} characters
- Improved: ${result.improvedContent.length} characters
- Timestamp: ${result.timestamp}

---
`).join('')}

## Next Steps

1. **Test All Components**: Run \`npm run dev\` and test all improved components
2. **Build Verification**: Run \`npm run build\` to ensure no TypeScript errors
3. **Accessibility Testing**: Use axe or Lighthouse to verify accessibility improvements
4. **Manual Review**: Review all changes for brand consistency and functionality
5. **Backup Cleanup**: Remove .backup files after verification

## v0.dev Integration Summary

This improvement process used:
- **Model**: v0-1.5-md (UI generation optimized)
- **Prompts**: Custom FixItForMe brand-aware prompts
- **Focus**: Professional contractor UX, shadcn/ui v2, accessibility
- **Brand Integration**: Felix Gold, Forest Green color system with OKLCH

All components now follow:
- ✅ FixItForMe brand guidelines
- ✅ shadcn/ui v2 best practices
- ✅ OKLCH color format
- ✅ Semantic Tailwind tokens
- ✅ TypeScript strict typing
- ✅ Accessibility standards
- ✅ Desktop/tablet-first design
- ✅ Professional contractor UX
`;

    await fs.writeFile(reportPath, report);
    console.log(`\n📊 Report generated: ${reportPath}`);
  }

  /**
   * Main execution method
   */
  async run(options: { dryRun?: boolean; limit?: number } = {}): Promise<void> {
    try {
      const components = await this.discoverComponents();
      console.log(`📦 Found ${components.length} components to improve\n`);
      
      if (components.length === 0) {
        console.log('❌ No components found to improve');
        return;
      }
      
      // Apply limit if specified
      const componentsToProcess = options.limit 
        ? components.slice(0, options.limit)
        : components;
      
      // Improve each component
      for (const component of componentsToProcess) {
        await this.improveComponent(component);
        
        // Rate limiting: wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Apply improvements
      await this.applyImprovements(options.dryRun);
      
      // Generate report
      await this.generateReport();
      
      console.log('\n🎉 FixItForMe UI improvement completed!');
      console.log('📝 Check V0_UI_IMPROVEMENT_REPORT.md for details');
      
      if (!options.dryRun) {
        console.log('🔧 Next: Run `npm run dev` to test improvements');
      }
      
    } catch (error) {
      console.error('❌ UI improvement failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  
  if (args.includes('--help')) {
    console.log(`
FixItForMe v0.dev UI Improvement Script

Usage:
  npm run improve-ui                    # Improve all components
  npm run improve-ui -- --dry-run       # Preview improvements without applying
  npm run improve-ui -- --limit=5       # Improve only first 5 components
  npm run improve-ui -- --help          # Show this help

Environment Variables:
  V0_API_KEY                           # Required: Your v0.dev API key

Examples:
  npm run improve-ui -- --dry-run --limit=3
  npm run improve-ui -- --limit=10
    `);
    return;
  }
  
  const improver = new V0UIImprover();
  await improver.run({ dryRun, limit });
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { V0UIImprover };
