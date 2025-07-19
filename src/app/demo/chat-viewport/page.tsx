/**
 * Comprehensive Chat Viewport Demo Page
 * 
 * Demonstrates the enhanced UnifiedChatInterface with proper viewport optimization
 * Shows all the UI improvements requested for chat centricity
 */

import ViewportDemo from '@/components/ui/ViewportDemo';

export default function ChatViewportDemo() {
  return (
    <div className="min-h-screen bg-background">
      <ViewportDemo />
    </div>
  );
}

export const metadata = {
  title: 'Enhanced Chat Interface Demo - FixItForMe',
  description: 'Comprehensive viewport optimization demonstration with Vercel AI patterns',
};
