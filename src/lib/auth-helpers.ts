/**
 * Authentication Helper Functions
 * Includes PWA cache clearing for login issues
 */

/**
 * Clear all authentication-related caches and storage
 * Call this when login fails or user reports login issues
 */
export function clearAuthenticationCache() {
  // Clear localStorage demo sessions
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('demo_session') || 
          key.includes('supabase') || 
          key.includes('auth') ||
          key.includes('contractor')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear service worker caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_AUTH_CACHE'
      });
    }
    
    console.log('[Auth] Cleared all authentication caches');
  }
}

/**
 * Listen for service worker storage clearing messages
 */
export function setupAuthCacheListener() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CLEAR_LOCAL_STORAGE') {
        console.log('[Auth] Service worker requested storage clearing');
        clearAuthenticationCache();
        
        // Optionally redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    });
  }
}

/**
 * Emergency login reset - call this when login is completely broken
 */
export function emergencyLoginReset() {
  clearAuthenticationCache();
  
  // Force reload to clear any in-memory state
  if (typeof window !== 'undefined') {
    window.location.href = '/login?reset=true';
  }
}
