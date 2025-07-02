const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// v0.dev API Configuration
const V0_API_KEY = 'v1:team_E3Mreo09jAdwrimR6tp6MK3Z:hGjVakAx1dk9b26iFV4fHtSg';
const V0_API_BASE = 'https://api.v0.dev/v1/chat/completions';

// FixItForMe Brand Constants (from brand analysis)
const BRAND_COLORS = {
  primary: '#D4A574', // Felix Gold
  secondary: '#1A2E1A', // Forest Green
  accent: '#4A6FA5', // Steel Blue
  success: '#22C55E',
  warning: '#F59E0B',
  destructive: '#EF4444'
};

const BRAND_FONTS = {
  sans: 'Inter',
  serif: 'Roboto Slab',
  heading: 'Roboto Slab'
};

class V0UIAnalyzer {
  constructor() {
    this.apiKey = V0_API_KEY;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
    this.analysisResults = [];
    this.improvements = [];
  }

  // Fetch current component content
  async readComponent(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      return content;
    } catch (error) {
      console.log(`⚠️  Could not read ${filePath}: ${error.message}`);
      return null;
    }
  }

  // Create v0.dev improvement prompt
  createPrompt(componentName, currentCode, brandContext) {
    return `You are a UI/UX expert improving the FixItForMe contractor module. This is a professional business application for contractors managing their home repair business.

BRAND REQUIREMENTS:
- Primary Color: ${BRAND_COLORS.primary} (Felix Gold) - premium quality, main CTAs
- Secondary Color: ${BRAND_COLORS.secondary} (Forest Green) - trust, stability, text
- Typography: ${BRAND_FONTS.sans} (UI), ${BRAND_FONTS.heading} (headlines)
- Style: Professional, trustworthy, desktop-first business tool

TARGET USERS: Professional contractors (not consumers)
CONTEXT: This is a B2B application for managing contractor business operations

TECHNICAL REQUIREMENTS:
- Next.js 15 + TypeScript
- shadcn/ui v2 with OKLCH colors
- Semantic Tailwind tokens (bg-primary, text-secondary, etc.)
- Accessibility (ARIA labels, focus management, keyboard nav)
- Error boundaries and loading states

CURRENT COMPONENT: ${componentName}
${brandContext}

CURRENT CODE:
\`\`\`tsx
${currentCode}
\`\`\`

Please generate ONLY the improved TypeScript React component code. Do not include any analysis or explanation - just return the complete, improved component code with:

1. FixItForMe brand colors and typography
2. Professional UX patterns for contractors
3. Better accessibility features
4. Improved visual hierarchy
5. Business-tool design patterns

Return ONLY the code wrapped in triple backticks with tsx language identifier.`;
  }

  // Call v0.dev API for component improvement
  async improveComponent(componentName, currentCode, brandContext = '') {
    console.log(`\n🔄 Analyzing ${componentName} with v0.dev API...`);
    
    const prompt = this.createPrompt(componentName, currentCode, brandContext);
    
    try {
      const response = await fetch(V0_API_BASE, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'v0-1.5-md',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const responseContent = result.choices[0].message.content;
      
      // Extract code from response
      const codeMatch = responseContent.match(/```tsx\n([\s\S]*?)\n```/);
      const improvedCode = codeMatch ? codeMatch[1] : null;
      
      if (!improvedCode) {
        throw new Error('No code found in v0.dev response');
      }

      const analysis = {
        component: componentName,
        timestamp: new Date().toISOString(),
        originalLength: currentCode.length,
        improvedLength: improvedCode.length,
        analysis: responseContent,
        improvedCode: improvedCode,
        apiResponse: result
      };

      this.analysisResults.push(analysis);
      
      console.log(`✅ Generated improved code for ${componentName} (${improvedCode.length} chars)`);
      return analysis;
      
    } catch (error) {
      console.error(`❌ Error analyzing ${componentName}:`, error.message);
      return {
        component: componentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Write improved code to component file
  async writeImprovedComponent(filePath, improvedCode, backup = true) {
    try {
      const fullPath = path.join(__dirname, filePath);
      
      // Create backup if requested
      if (backup) {
        const backupPath = `${fullPath}.backup-${Date.now()}`;
        const originalContent = fs.readFileSync(fullPath, 'utf8');
        fs.writeFileSync(backupPath, originalContent);
        console.log(`💾 Backup created: ${backupPath}`);
      }
      
      // Write improved code
      fs.writeFileSync(fullPath, improvedCode);
      console.log(`✍️  Improved code written to: ${filePath}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Error writing to ${filePath}:`, error.message);
      return false;
    }
  }

  // Analyze multiple components
  async analyzeComponents() {
    console.log('🚀 Starting v0.dev UI Analysis for FixItForMe...\n');

    // Priority components to analyze
    const components = [
      {
        name: 'Dashboard Page',
        path: 'src/app/contractor/dashboard/page.tsx',
        context: 'Main contractor dashboard - needs professional data tables, charts, and agent chat integration'
      },
      {
        name: 'Login Page', 
        path: 'src/app/login/page.tsx',
        context: 'Professional contractor authentication - needs trust indicators and security elements'
      },
      {
        name: 'Bid Details Page',
        path: 'src/app/contractor/bid/[job_id]/page.tsx', 
        context: 'Job analysis interface - needs professional estimate presentation and Alex agent integration'
      },
      {
        name: 'Button Component',
        path: 'src/components/ui/button.tsx',
        context: 'Core UI button - needs FixItForMe brand colors and professional styling'
      },
      {
        name: 'Card Component',
        path: 'src/components/ui/card.tsx',
        context: 'UI card component - needs professional styling and FixItForMe brand consistency'
      }
    ];

    // Analyze each component
    for (const component of components) {
      const currentCode = await this.readComponent(component.path);
      
      if (currentCode) {
        const analysis = await this.improveComponent(component.name, currentCode, component.context);
        
        // Write improved code if generated successfully
        if (analysis.improvedCode && !analysis.error) {
          const writeSuccess = await this.writeImprovedComponent(component.path, analysis.improvedCode);
          analysis.writeSuccess = writeSuccess;
          
          if (writeSuccess) {
            console.log(`🎉 Successfully improved and updated ${component.name}`);
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Generate comprehensive report
    return await this.generateReport();
  }

  // Generate analysis report
  async generateReport() {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = `v0-improvement-report-${timestamp}.md`;
    
    let report = `# FixItForMe v0.dev UI Improvement Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n`;
    report += `**API Key Used:** ${this.apiKey.substring(0, 20)}...\n`;
    report += `**Components Processed:** ${this.analysisResults.length}\n\n`;

    const successfulImprovements = this.analysisResults.filter(r => r.improvedCode && r.writeSuccess);
    const errors = this.analysisResults.filter(r => r.error);

    report += `## Executive Summary\n\n`;
    report += `✅ **Successfully Improved:** ${successfulImprovements.length} components\n`;
    report += `❌ **Errors:** ${errors.length} components\n`;
    report += `📝 **Code Generated:** ${this.analysisResults.filter(r => r.improvedCode).length} components\n`;
    report += `💾 **Files Updated:** ${this.analysisResults.filter(r => r.writeSuccess).length} components\n\n`;

    report += `This report shows v0.dev API improvements applied to FixItForMe UI components, focusing on:\n`;
    report += `- Professional contractor workflow optimization\n`;
    report += `- FixItForMe brand consistency (Felix Gold #D4A574, Forest Green #1A2E1A)\n`;
    report += `- Business tool UX patterns (desktop-first, professional)\n`;
    report += `- Accessibility and technical improvements\n\n`;

    // Successful improvements
    if (successfulImprovements.length > 0) {
      report += `## ✅ Successfully Improved Components\n\n`;
      
      for (const analysis of successfulImprovements) {
        report += `### ${analysis.component}\n\n`;
        report += `- **Original Size:** ${analysis.originalLength} characters\n`;
        report += `- **Improved Size:** ${analysis.improvedLength} characters\n`;
        report += `- **File Updated:** Yes ✅\n`;
        report += `- **Backup Created:** Yes 💾\n\n`;
      }
    }

    // Individual component analyses
    for (const analysis of this.analysisResults) {
      if (analysis.error) {
        report += `## ❌ ${analysis.component}\n\n`;
        report += `**Error:** ${analysis.error}\n\n`;
        continue;
      }

      report += `## 🔍 ${analysis.component}\n\n`;
      report += `**Timestamp:** ${analysis.timestamp}\n`;
      report += `**Original Size:** ${analysis.originalLength} characters\n`;
      
      if (analysis.improvedCode) {
        report += `**Improved Size:** ${analysis.improvedLength} characters\n`;
        report += `**File Updated:** ${analysis.writeSuccess ? 'Yes ✅' : 'Failed ❌'}\n`;
      }
      
      report += `\n### v0.dev Response\n\n`;
      report += `${analysis.analysis}\n\n`;
      
      if (analysis.improvedCode) {
        report += `### Generated Code Preview\n\n`;
        report += `\`\`\`tsx\n`;
        report += `${analysis.improvedCode.substring(0, 500)}${analysis.improvedCode.length > 500 ? '...' : ''}\n`;
        report += `\`\`\`\n\n`;
      }
      
      report += `---\n\n`;
    }

    // Technical summary
    report += `## 🛠️ Implementation Summary\n\n`;
    report += `### Files Modified\n\n`;
    for (const analysis of successfulImprovements) {
      report += `- **${analysis.component}**: Code updated with v0.dev improvements\n`;
    }
    
    report += `\n### Backup Files Created\n\n`;
    report += `All original files were backed up before modification with timestamp suffix.\n`;
    report += `Example: \`component.tsx.backup-1704067200000\`\n\n`;

    // Next steps
    report += `## 🎯 Next Steps\n\n`;
    report += `1. **Test Components**: Verify all improved components render correctly\n`;
    report += `2. **Build Check**: Run \`npm run build\` to ensure no TypeScript errors\n`;
    report += `3. **Visual Review**: Check brand colors and professional styling\n`;
    report += `4. **Functionality Test**: Ensure all component functionality works\n`;
    report += `5. **Accessibility Test**: Verify improved ARIA and keyboard navigation\n\n`;

    // Metrics
    report += `## 📊 Improvement Metrics\n\n`;
    report += `- **API Calls Made**: ${this.analysisResults.length}\n`;
    report += `- **Code Generated**: ${this.analysisResults.filter(r => r.improvedCode).length} components\n`;
    report += `- **Files Updated**: ${successfulImprovements.length}/${this.analysisResults.length}\n`;
    report += `- **Error Rate**: ${Math.round((errors.length / this.analysisResults.length) * 100)}%\n\n`;

    report += `---\n\n`;
    report += `*Generated by FixItForMe v0.dev UI Improvement System*\n`;
    report += `*Backups created for all modified files*`;

    // Save report
    fs.writeFileSync(reportPath, report);
    console.log(`\n📋 Improvement report saved to: ${reportPath}`);

    // Save raw analysis data
    const dataPath = `v0-analysis-data-${timestamp}.json`;
    fs.writeFileSync(dataPath, JSON.stringify(this.analysisResults, null, 2));
    console.log(`📊 Raw analysis data saved to: ${dataPath}`);

    return {
      reportPath,
      dataPath,
      componentsAnalyzed: this.analysisResults.length,
      successfulImprovements: successfulImprovements.length,
      errors: errors.length
    };
  }
}

// Execute analysis
async function main() {
  console.log('🎨 FixItForMe v0.dev UI Improvement System Starting...');
  console.log(`🔑 Using API Key: ${V0_API_KEY.substring(0, 30)}...`);
  console.log(`🎯 Target: Professional contractor UI improvements with code generation\n`);

  const analyzer = new V0UIAnalyzer();
  
  try {
    const results = await analyzer.analyzeComponents();
    
    console.log('\n🎉 UI Improvement Complete!');
    console.log(`📋 Report: ${results.reportPath}`);
    console.log(`📊 Data: ${results.dataPath}`);
    console.log(`✅ Components Improved: ${results.successfulImprovements}/${results.componentsAnalyzed}`);
    console.log(`❌ Errors: ${results.errors}`);
    
    if (results.successfulImprovements > 0) {
      console.log('\n💾 Backup files created for all modified components');
      console.log('🔧 Next steps: Test components, run build, verify styling');
    }
    
  } catch (error) {
    console.error('\n❌ UI improvement failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { V0UIAnalyzer, BRAND_COLORS, BRAND_FONTS };
