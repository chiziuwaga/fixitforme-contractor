/**
 * Chat Viewport Optimization System
 * 
 * Comprehensive viewport management for UnifiedChatInterface
 * Integrates with our 8-breakpoint responsive system
 */

import { DESKTOP_BREAKPOINTS, MOBILE_BREAKPOINT } from './responsive';

// Viewport Detection
export type ViewportSize = 'mobile' | 'tablet_portrait' | 'tablet_landscape' | 'desktop_small' | 'desktop_medium' | 'desktop_large' | 'desktop_xl' | 'ultrawide' | 'superwide' | 'cinema' | 'massive';

export const detectViewportSize = (): ViewportSize => {
  if (typeof window === 'undefined') return 'desktop_medium';
  
  const width = window.innerWidth;
  
  // Mobile redirect zone
  if (width <= MOBILE_BREAKPOINT.max) return 'mobile';
  
  // Tablet zones
  if (width >= 768 && width <= 834) return 'tablet_portrait';
  if (width >= 835 && width <= 1023) return 'tablet_landscape';
  
  // Desktop zones
  if (width >= DESKTOP_BREAKPOINTS.small.min && width <= DESKTOP_BREAKPOINTS.small.max) return 'desktop_small';
  if (width >= DESKTOP_BREAKPOINTS.medium.min && width <= DESKTOP_BREAKPOINTS.medium.max) return 'desktop_medium';
  if (width >= DESKTOP_BREAKPOINTS.large.min && width <= DESKTOP_BREAKPOINTS.large.max) return 'desktop_large';
  if (width >= DESKTOP_BREAKPOINTS.xlarge.min && width <= DESKTOP_BREAKPOINTS.xlarge.max) return 'desktop_xl';
  if (width >= DESKTOP_BREAKPOINTS.ultrawide.min && width <= DESKTOP_BREAKPOINTS.ultrawide.max) return 'ultrawide';
  if (width >= DESKTOP_BREAKPOINTS.superwide.min && width <= DESKTOP_BREAKPOINTS.superwide.max) return 'superwide';
  if (width >= DESKTOP_BREAKPOINTS.cinema.min && width <= DESKTOP_BREAKPOINTS.cinema.max) return 'cinema';
  if (width >= DESKTOP_BREAKPOINTS.massive.min) return 'massive';
  
  return 'desktop_medium';
};

// Chat Layout Configurations by Viewport
export const CHAT_VIEWPORT_CONFIGS = {
  mobile: {
    sidebarMode: 'overlay' as const,
    sidebarWidth: '100%',
    chatHeight: '100vh',
    messageSpacing: 'compact' as const,
    headerHeight: '56px',
    inputHeight: '60px',
    avatarSize: '32px',
    typography: 'mobile' as const,
    messagesPerPage: 20,
    threadGrouping: 'compact' as const
  },
  tablet_portrait: {
    sidebarMode: 'collapsible' as const,
    sidebarWidth: '280px',
    chatHeight: '90vh',
    messageSpacing: 'normal' as const,
    headerHeight: '64px',
    inputHeight: '72px',
    avatarSize: '36px',
    typography: 'tablet' as const,
    messagesPerPage: 30,
    threadGrouping: 'normal' as const
  },
  tablet_landscape: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '320px',
    chatHeight: '85vh',
    messageSpacing: 'normal' as const,
    headerHeight: '64px',
    inputHeight: '72px',
    avatarSize: '40px',
    typography: 'tablet' as const,
    messagesPerPage: 40,
    threadGrouping: 'normal' as const
  },
  desktop_small: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '320px',
    chatHeight: '80vh',
    messageSpacing: 'comfortable' as const,
    headerHeight: '72px',
    inputHeight: '80px',
    avatarSize: '40px',
    typography: 'desktop' as const,
    messagesPerPage: 50,
    threadGrouping: 'detailed' as const
  },
  desktop_medium: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '360px',
    chatHeight: '85vh',
    messageSpacing: 'comfortable' as const,
    headerHeight: '72px',
    inputHeight: '80px',
    avatarSize: '44px',
    typography: 'desktop' as const,
    messagesPerPage: 50,
    threadGrouping: 'detailed' as const
  },
  desktop_large: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '400px',
    chatHeight: '90vh',
    messageSpacing: 'spacious' as const,
    headerHeight: '80px',
    inputHeight: '88px',
    avatarSize: '48px',
    typography: 'desktop' as const,
    messagesPerPage: 60,
    threadGrouping: 'detailed' as const
  },
  desktop_xl: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '440px',
    chatHeight: '90vh',
    messageSpacing: 'spacious' as const,
    headerHeight: '80px',
    inputHeight: '88px',
    avatarSize: '48px',
    typography: 'desktop' as const,
    messagesPerPage: 70,
    threadGrouping: 'detailed' as const
  },
  ultrawide: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '480px',
    chatHeight: '95vh',
    messageSpacing: 'luxurious' as const,
    headerHeight: '88px',
    inputHeight: '96px',
    avatarSize: '52px',
    typography: 'ultrawide' as const,
    messagesPerPage: 80,
    threadGrouping: 'expansive' as const
  },
  superwide: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '520px',
    chatHeight: '95vh',
    messageSpacing: 'luxurious' as const,
    headerHeight: '96px',
    inputHeight: '104px',
    avatarSize: '56px',
    typography: 'ultrawide' as const,
    messagesPerPage: 100,
    threadGrouping: 'expansive' as const
  },
  cinema: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '600px',
    chatHeight: '95vh',
    messageSpacing: 'cinematic' as const,
    headerHeight: '104px',
    inputHeight: '112px',
    avatarSize: '60px',
    typography: 'ultrawide' as const,
    messagesPerPage: 120,
    threadGrouping: 'cinematic' as const
  },
  massive: {
    sidebarMode: 'persistent' as const,
    sidebarWidth: '640px',
    chatHeight: '98vh',
    messageSpacing: 'cinematic' as const,
    headerHeight: '112px',
    inputHeight: '120px',
    avatarSize: '64px',
    typography: 'ultrawide' as const,
    messagesPerPage: 150,
    threadGrouping: 'cinematic' as const
  }
};

// Message Spacing Configurations
export const MESSAGE_SPACING_CONFIGS = {
  compact: {
    messagePadding: 'p-2',
    messageGap: 'space-y-2',
    avatarGap: 'gap-2',
    bubblePadding: 'px-3 py-2',
    fontSize: 'text-sm'
  },
  normal: {
    messagePadding: 'p-3',
    messageGap: 'space-y-3',
    avatarGap: 'gap-3',
    bubblePadding: 'px-4 py-2',
    fontSize: 'text-sm'
  },
  comfortable: {
    messagePadding: 'p-4',
    messageGap: 'space-y-4',
    avatarGap: 'gap-3',
    bubblePadding: 'px-4 py-3',
    fontSize: 'text-sm'
  },
  spacious: {
    messagePadding: 'p-5',
    messageGap: 'space-y-5',
    avatarGap: 'gap-4',
    bubblePadding: 'px-5 py-3',
    fontSize: 'text-base'
  },
  luxurious: {
    messagePadding: 'p-6',
    messageGap: 'space-y-6',
    avatarGap: 'gap-5',
    bubblePadding: 'px-6 py-4',
    fontSize: 'text-base'
  },
  cinematic: {
    messagePadding: 'p-8',
    messageGap: 'space-y-8',
    avatarGap: 'gap-6',
    bubblePadding: 'px-8 py-5',
    fontSize: 'text-lg'
  }
};

// Thread Grouping Configurations
export const THREAD_GROUPING_CONFIGS = {
  compact: {
    showDateHeaders: false,
    threadPadding: 'p-2',
    threadHeight: '60px',
    showPreview: false,
    showAgentIcon: true,
    maxTitleLength: 30,
    showMessageCount: false,
    showLastActivity: false
  },
  normal: {
    showDateHeaders: true,
    threadPadding: 'p-3',
    threadHeight: '72px',
    showPreview: true,
    showAgentIcon: true,
    maxTitleLength: 40,
    showMessageCount: true,
    showLastActivity: true
  },
  detailed: {
    showDateHeaders: true,
    threadPadding: 'p-4',
    threadHeight: '84px',
    showPreview: true,
    showAgentIcon: true,
    maxTitleLength: 60,
    showMessageCount: true,
    showLastActivity: true
  },
  expansive: {
    showDateHeaders: true,
    threadPadding: 'p-5',
    threadHeight: '96px',
    showPreview: true,
    showAgentIcon: true,
    maxTitleLength: 80,
    showMessageCount: true,
    showLastActivity: true,
    showTags: true
  },
  cinematic: {
    showDateHeaders: true,
    threadPadding: 'p-6',
    threadHeight: '120px',
    showPreview: true,
    showAgentIcon: true,
    maxTitleLength: 100,
    showMessageCount: true,
    showLastActivity: true,
    showTags: true,
    showThumbnails: true
  }
};

// Chat Performance Configurations
export const CHAT_PERFORMANCE_CONFIGS = {
  virtualization: {
    threshold: 50, // Start virtualizing after 50 messages
    overscan: 5,   // Render 5 extra items for smooth scrolling
    itemHeight: {
      compact: 60,
      normal: 80,
      comfortable: 100,
      spacious: 120,
      luxurious: 140,
      cinematic: 180
    }
  },
  debounce: {
    search: 300,     // 300ms search debounce
    scroll: 16,      // 60fps scroll handling
    resize: 150      // 150ms resize debounce
  },
  lazy: {
    imageThreshold: '50px',    // Load images 50px before visible
    threadThreshold: '100px',  // Load thread content 100px before
    uiAssetThreshold: '30px'   // Load UI assets 30px before
  }
};

// Keyboard Shortcuts
export const CHAT_KEYBOARD_SHORTCUTS = {
  // Agent switching
  'cmd+1': 'switch-to-lexi',
  'cmd+2': 'switch-to-alex',
  'cmd+3': 'switch-to-rex',
  
  // Navigation
  'cmd+k': 'toggle-agent-selector',
  'cmd+b': 'toggle-sidebar',
  'cmd+n': 'new-conversation',
  'cmd+f': 'search-conversations',
  
  // Message actions
  'cmd+enter': 'send-message',
  'esc': 'clear-input',
  'up-arrow': 'previous-message-history',
  'down-arrow': 'next-message-history',
  
  // UI actions
  'cmd+plus': 'increase-text-size',
  'cmd+minus': 'decrease-text-size',
  'cmd+0': 'reset-text-size'
};

// Accessibility Configurations
export const CHAT_ACCESSIBILITY_CONFIGS = {
  animations: {
    reducedMotion: 'prefers-reduced-motion: reduce',
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    }
  },
  focus: {
    outlineWidth: '2px',
    outlineOffset: '2px',
    skipLinks: ['#chat-input', '#agent-selector', '#conversation-list']
  },
  colorContrast: {
    minimumRatio: 4.5,
    preferredRatio: 7.0
  },
  typography: {
    minimumSize: '14px',
    lineHeight: 1.5,
    characterSpacing: '0.02em'
  }
};

// Utility function to get current viewport configuration
export const useViewportConfig = () => {
  const viewportSize = detectViewportSize();
  return CHAT_VIEWPORT_CONFIGS[viewportSize];
};

// Utility function to get responsive chat classes
export const getChatResponsiveClasses = (viewportSize: ViewportSize) => {
  const config = CHAT_VIEWPORT_CONFIGS[viewportSize];
  const spacing = MESSAGE_SPACING_CONFIGS[config.messageSpacing];
  
  return {
    container: `h-[${config.chatHeight}] max-h-screen`,
    sidebar: `w-[${config.sidebarWidth}]`,
    header: `h-[${config.headerHeight}]`,
    input: `min-h-[${config.inputHeight}]`,
    avatar: `w-[${config.avatarSize}] h-[${config.avatarSize}]`,
    message: `${spacing.messagePadding} ${spacing.fontSize}`,
    messageContainer: spacing.messageGap,
    bubble: spacing.bubblePadding
  };
};
