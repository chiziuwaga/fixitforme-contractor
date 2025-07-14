/**
 * WhatsApp Sandbox Authentication Helpers
 * Pure WhatsApp sandbox utilities (no demo mode)
 */

/**
 * Clear all authentication-related storage
 */
export function clearAuthenticationStorage(): void {
  if (typeof window === 'undefined') return;
  
  // Clear any remaining demo sessions
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('fixitforme_demo_session_') || 
        key.includes('supabase') || 
        key.includes('auth') ||
        key.includes('contractor')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear session storage
  sessionStorage.clear();
  
  // Clear service worker caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('auth') || name.includes('login')) {
          caches.delete(name);
        }
      });
    });
  }
  
  // Send message to service worker to clear auth caches
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_AUTH_CACHE'
    });
  }
  
  console.log('[Auth] Cleared all authentication storage');
}

/**
 * WhatsApp sandbox join instructions
 */
export const WHATSAPP_SANDBOX_INSTRUCTIONS = {
  phoneNumber: '+1 415 523 8886',
  joinMessage: 'join shine-native',
  joinLink: 'https://wa.me/14155238886?text=join%20shine-native',
  validFor: '72 hours',
  steps: [
    'Send "join shine-native" to +1 415 523 8886',
    'Wait for confirmation message',
    'Try login again within 72 hours'
  ]
};

/**
 * WhatsApp sandbox error handler
 */
export function handleWhatsAppError(error: any): {
  message: string;
  instructions: string[];
  needsSandboxJoin: boolean;
} {
  if (error?.code === 63015 || error?.code === 63016) {
    return {
      message: 'WhatsApp sandbox not joined',
      instructions: WHATSAPP_SANDBOX_INSTRUCTIONS.steps,
      needsSandboxJoin: true
    };
  }
  
  if (error?.message?.includes('sandbox')) {
    return {
      message: 'WhatsApp sandbox issue',
      instructions: [
        'Check if you joined the sandbox recently',
        'Sandbox connections expire every 72 hours',
        ...WHATSAPP_SANDBOX_INSTRUCTIONS.steps
      ],
      needsSandboxJoin: true
    };
  }
  
  return {
    message: error?.message || 'WhatsApp authentication failed',
    instructions: ['Try again in a few moments', 'Check your internet connection'],
    needsSandboxJoin: false
  };
}
