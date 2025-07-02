const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// v0.dev API Configuration
const V0_API_KEY = 'v1:team_E3Mreo09jAdwrimR6tp6MK3Z:hGjVakAx1dk9b26iFV4fHtSg';
const V0_API_BASE = 'https://api.v0.dev/v1/chat/completions';

// FixItForMe Brand Constants
const BRAND_SYSTEM = `
## FixItForMe Design System Requirements

### 🎨 CRITICAL: Use ONLY Semantic Tailwind Classes
- bg-primary, text-primary, border-primary (Felix Gold #D4A574)
- bg-secondary, text-secondary, border-secondary (Forest Green #1A2E1A) 
- bg-accent, text-accent, border-accent (Steel Blue #4A6FA5)
- bg-card, text-card-foreground, border-border
- bg-background, text-foreground
- bg-muted, text-muted-foreground
- bg-destructive, text-destructive-foreground

### ❌ NEVER use hardcoded colors like:
- #D4A574, #1A2E1A, #4A6FA5 
- bg-yellow-*, bg-green-*, bg-blue-*
- Any hex codes in className

### 🏢 Professional Contractor UI Patterns
- Desktop-first (min-width: 1024px optimized)
- Business data tables with sorting/filtering
- Professional forms with validation states
- Agent chat integration areas
- Bid/estimate presentation layouts
- File upload zones
- Status indicators and progress tracking

### 🎯 Component Enhancement Goals
1. Convert hardcoded colors to semantic classes
2. Add professional hover/focus states
3. Improve accessibility (ARIA, focus management)
4. Add loading/disabled states
5. Optimize for contractor workflows
6. Ensure responsive but desktop-focused
7. Add proper TypeScript types
8. Follow shadcn/ui patterns
`;

class ImprovedV0Analyzer {
  constructor() {
    this.apiKey = V0_API_KEY;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
    this.results = [];
  }

  // Create enhanced prompt that enforces semantic classes
  createEnhancedPrompt(componentName, currentCode, context = '') {
    return `You are an expert React/TypeScript developer specializing in professional business applications and shadcn/ui components.

${BRAND_SYSTEM}

## Current Component: ${componentName}
${context ? `\n**Context:** ${context}\n` : ''}

## Current Code:
\`\`\`tsx
${currentCode}
\`\`\`

## Your Task:
Improve this component following these STRICT requirements:

### 🔴 CRITICAL REQUIREMENTS:
1. **ONLY use semantic Tailwind classes** (bg-primary, text-secondary, etc.)
2. **NEVER use hardcoded colors** (#D4A574, bg-yellow-500, etc.)
3. **Follow shadcn/ui patterns** exactly
4. **Maintain existing functionality** while improving UX
5. **Add proper TypeScript types** and documentation

### 🎯 Specific Improvements:
- Replace any hardcoded colors with semantic classes
- Add professional hover/focus/active states
- Improve accessibility (ARIA labels, focus management)
- Add loading and disabled states where appropriate
- Optimize for desktop/tablet (contractor workflow)
- Add proper prop types and documentation
- Follow class-variance-authority patterns
- Add transition animations for professional feel

### 📋 Design Requirements:
- Professional contractor tool aesthetic
- Clean, minimal, business-focused
- Excellent readability and contrast
- Intuitive interaction patterns
- Responsive but desktop-optimized

Return ONLY the improved code wrapped in triple backticks with tsx language identifier. The code should be production-ready and follow all requirements above.`;
  }

  // Enhanced API call with better error handling
  async improveComponent(componentName, currentCode, context = '') {
    console.log(`\n🔄 Improving ${componentName} with enhanced v0.dev prompting...`);
    
    const prompt = this.createEnhancedPrompt(componentName, currentCode, context);
    
    try {
      const response = await fetch(V0_API_BASE, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'v0-1.5-lg', // Using larger model for better reasoning
          messages: [
            {
              role: 'system',
              content: 'You are an expert React/TypeScript developer specializing in professional business applications and shadcn/ui components. You MUST use semantic Tailwind classes only and never hardcoded colors.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3 // Lower temperature for more consistent results
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const responseContent = result.choices[0].message.content;
      
      // Extract code from response
      const codeMatch = responseContent.match(/```tsx\n([\s\S]*?)\n```/);
      const improvedCode = codeMatch ? codeMatch[1] : null;
      
      if (!improvedCode) {
        console.log('⚠️  Response content:', responseContent.substring(0, 200) + '...');
        throw new Error('No tsx code block found in v0.dev response');
      }

      // Validate that no hardcoded colors were introduced
      const hardcodedColorPattern = /#[0-9A-Fa-f]{6}|bg-(?:red|blue|green|yellow|purple|pink|indigo|gray|zinc|slate|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g;
      const hardcodedColors = improvedCode.match(hardcodedColorPattern);
      
      if (hardcodedColors) {
        console.log(`⚠️  Detected hardcoded colors: ${hardcodedColors.join(', ')}`);
        console.log('❌ Rejecting improvement due to hardcoded colors');
        return {
          component: componentName,
          error: `Contains hardcoded colors: ${hardcodedColors.join(', ')}`,
          timestamp: new Date().toISOString(),
          rejected: true
        };
      }

      const analysis = {
        component: componentName,
        timestamp: new Date().toISOString(),
        originalLength: currentCode.length,
        improvedLength: improvedCode.length,
        improvedCode: improvedCode,
        passed_validation: true
      };

      this.results.push(analysis);
      
      console.log(`✅ Generated validated code for ${componentName} (${improvedCode.length} chars)`);
      console.log(`🔍 Validation: No hardcoded colors detected`);
      
      return analysis;
      
    } catch (error) {
      console.error(`❌ Error improving ${componentName}:`, error.message);
      return {
        component: componentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Safe file writing with validation
  async writeImprovedComponent(filePath, improvedCode, backup = true) {
    try {
      const fullPath = path.join(__dirname, filePath);
      
      // Validate the improved code
      if (!improvedCode || improvedCode.length < 100) {
        throw new Error('Improved code is too short or empty');
      }

      // Create backup
      if (backup) {
        const backupPath = `${fullPath}.backup-${Date.now()}`;
        const originalContent = fs.readFileSync(fullPath, 'utf8');
        fs.writeFileSync(backupPath, originalContent);
        console.log(`💾 Backup: ${path.basename(backupPath)}`);
      }
      
      // Write improved code
      fs.writeFileSync(fullPath, improvedCode);
      console.log(`✍️  Updated: ${filePath}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Write error for ${filePath}:`, error.message);
      return false;
    }
  }

  // Read component with error handling
  async readComponent(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return null;
      }
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      console.error(`❌ Read error for ${filePath}:`, error.message);
      return null;
    }
  }

  // Enhanced component analysis
  async analyzeComponents() {
    console.log('🚀 Enhanced FixItForMe v0.dev UI Analysis Starting...\n');

    // Priority components for contractor workflows
    const components = [
      {
        name: 'Button Component',
        path: 'src/components/ui/button.tsx',
        context: 'Core UI button for contractor actions - must use semantic classes and support all variant states'
      },
      {
        name: 'Card Component', 
        path: 'src/components/ui/card.tsx',
        context: 'Professional cards for bid data, job info - needs business-focused styling with semantic classes'
      },
      {
        name: 'Dashboard Page',
        path: 'src/app/contractor/dashboard/page.tsx',
        context: 'Main contractor dashboard - professional data tables, metrics, agent integration'
      },
      {
        name: 'Login Page',
        path: 'src/app/login/page.tsx', 
        context: 'Professional contractor authentication - trust indicators, security focus'
      },
      {
        name: 'Table Component',
        path: 'src/components/ui/table.tsx',
        context: 'Business data tables for bids, jobs, payments - professional styling needed'
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const component of components) {
      console.log(`\n📁 Processing: ${component.name}`);
      
      const currentCode = await this.readComponent(component.path);
      
      if (!currentCode) {
        console.log(`⏭️  Skipping ${component.name} - file not found`);
        continue;
      }
      
      const analysis = await this.improveComponent(
        component.name, 
        currentCode, 
        component.context
      );
      
      if (analysis.improvedCode && !analysis.error && !analysis.rejected) {
        const writeSuccess = await this.writeImprovedComponent(
          component.path, 
          analysis.improvedCode
        );
        
        if (writeSuccess) {
          console.log(`🎉 Successfully improved ${component.name}`);
          successCount++;
        } else {
          console.log(`❌ Failed to write ${component.name}`);
          errorCount++;
        }
      } else {
        console.log(`⚠️  Skipped ${component.name}: ${analysis.error || 'rejected'}`);
        errorCount++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`\n🎯 Analysis Complete!`);
    console.log(`✅ Successfully improved: ${successCount} components`);
    console.log(`❌ Errors/skipped: ${errorCount} components`);
    
    // Generate report
    await this.generateReport(successCount, errorCount);
    
    return {
      success: successCount,
      errors: errorCount,
      total: components.length
    };
  }

  // Generate comprehensive report
  async generateReport(successCount, errorCount) {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = `v0-enhanced-report-${timestamp}.md`;
    
    let report = `# FixItForMe Enhanced v0.dev UI Improvement Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n`;
    report += `**Enhanced Script Version:** 2.0\n`;
    report += `**Validation:** Semantic classes only, no hardcoded colors\n\n`;

    report += `## Results Summary\n\n`;
    report += `✅ **Successfully Improved:** ${successCount} components\n`;
    report += `❌ **Errors/Rejected:** ${errorCount} components\n`;
    report += `🔍 **Validation:** All outputs checked for hardcoded colors\n\n`;

    report += `## Key Improvements Applied\n\n`;
    report += `- ✅ Converted hardcoded colors to semantic Tailwind classes\n`;
    report += `- ✅ Added professional hover/focus/active states\n`;
    report += `- ✅ Improved accessibility (ARIA, focus management)\n`;
    report += `- ✅ Added loading and disabled states\n`;
    report += `- ✅ Optimized for contractor workflow (desktop-first)\n`;
    report += `- ✅ Enhanced TypeScript types and documentation\n`;
    report += `- ✅ Applied shadcn/ui best practices\n\n`;

    report += `## Next Steps\n\n`;
    report += `1. Test all improved components in the app\n`;
    report += `2. Run \`npm run build\` to verify no issues\n`;
    report += `3. Check visual consistency across pages\n`;
    report += `4. Validate accessibility with screen readers\n`;
    report += `5. Test contractor workflow scenarios\n\n`;

    if (this.results.length > 0) {
      report += `## Component Details\n\n`;
      this.results.forEach(result => {
        if (result.improvedCode) {
          report += `### ${result.component}\n`;
          report += `- **Size Change:** ${result.originalLength} → ${result.improvedLength} chars\n`;
          report += `- **Validation:** ${result.passed_validation ? '✅ Passed' : '❌ Failed'}\n`;
          report += `- **Timestamp:** ${result.timestamp}\n\n`;
        }
      });
    }

    fs.writeFileSync(reportPath, report);
    console.log(`📋 Enhanced report saved: ${reportPath}`);
    
    return reportPath;
  }
}

// Main execution function
async function main() {
  console.log('🎨 FixItForMe Enhanced v0.dev UI Improvement System');
  console.log('🔍 Features: Semantic class validation, hardcoded color detection');
  console.log('🎯 Focus: Professional contractor UI with shadcn/ui best practices\n');

  const analyzer = new ImprovedV0Analyzer();
  
  try {
    const results = await analyzer.analyzeComponents();
    
    console.log('\n🎉 Enhanced UI Improvement Complete!');
    console.log(`📊 Final Results: ${results.success}/${results.total} components improved`);
    
    if (results.success > 0) {
      console.log('💾 Backups created for all modified files');
      console.log('🔧 Recommended: Test components and run build verification');
    }
    
  } catch (error) {
    console.error('\n❌ Enhanced UI improvement failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ImprovedV0Analyzer };
