#!/usr/bin/env node

/**
 * PWA CACHE SAFETY FIXER
 * 
 * Ensures PWA service worker doesn't cache authentication routes or cause login issues.
 * Runs automatically during build process to prevent caching conflicts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}🛠️  PWA CACHE SAFETY FIXER${colors.reset}\n`);

/**
 * Fix service worker to prevent authentication caching issues
 */
function fixServiceWorkerCaching() {
  const swPath = path.join(__dirname, '..', 'public', 'sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.log(`${colors.yellow}⚠️  Service worker not found, skipping PWA cache fixes${colors.reset}`);
    return;
  }
  
  let swContent = fs.readFileSync(swPath, 'utf8');
  let modified = false;
  
  // 1. Ensure authentication routes are never cached
  const authCacheBypass = `
  // AUTHENTICATION CACHE BYPASS - CRITICAL FOR LOGIN
  if (url.pathname.includes('/api/auth/') || 
      url.pathname.includes('/login') || 
      url.pathname.includes('/auth/') ||
      url.pathname === '/') {
    console.log('[SW] Bypassing cache for auth route:', url.pathname);
    event.respondWith(fetch(request, { redirect: 'follow' }));
    return;
  }`;
  
  if (!swContent.includes('AUTHENTICATION CACHE BYPASS')) {
    // Find the fetch event listener and add auth bypass at the start
    const fetchEventRegex = /self\.addEventListener\('fetch',\s*\(event\)\s*=>\s*{/;
    if (fetchEventRegex.test(swContent)) {
      swContent = swContent.replace(fetchEventRegex, (match) => {
        return match + authCacheBypass;
      });
      modified = true;
      console.log(`${colors.green}✅ Added authentication cache bypass${colors.reset}`);
    }
  } else {
    console.log(`${colors.cyan}ℹ️  Authentication cache bypass already present${colors.reset}`);
  }
  
  // 2. Increment cache version to force refresh
  const cacheVersionRegex = /CACHE_NAME = ['"`].*?v(\d+)\.(\d+)\.(\d+)['"`]/;
  const versionMatch = swContent.match(cacheVersionRegex);
  
  if (versionMatch) {
    const [fullMatch, major, minor, patch] = versionMatch;
    const newPatch = parseInt(patch) + 1;
    const newVersion = `${major}.${minor}.${newPatch}`;
    
    swContent = swContent.replace(cacheVersionRegex, 
      fullMatch.replace(`v${major}.${minor}.${patch}`, `v${newVersion}`));
    modified = true;
    console.log(`${colors.green}✅ Incremented cache version to v${newVersion}${colors.reset}`);
  }
  
  // 3. Add explicit localStorage/sessionStorage clearing for login issues
  const storageCleanup = `
  // Clear browser storage on auth errors to prevent login issues
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_AUTH_CACHE') {
      console.log('[SW] Clearing authentication cache');
      caches.delete(CACHE_NAME);
      caches.delete(STATIC_CACHE);
      
      // Notify all clients to clear localStorage
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CLEAR_LOCAL_STORAGE' });
        });
      });
    }
  });`;
  
  if (!swContent.includes('CLEAR_AUTH_CACHE')) {
    swContent += storageCleanup;
    modified = true;
    console.log(`${colors.green}✅ Added storage cleanup for auth errors${colors.reset}`);
  } else {
    console.log(`${colors.cyan}ℹ️  Storage cleanup already present${colors.reset}`);
  }
  
  // 4. Write modified service worker
  if (modified) {
    fs.writeFileSync(swPath, swContent);
    console.log(`${colors.green}✅ Service worker updated with login safety fixes${colors.reset}`);
  } else {
    console.log(`${colors.cyan}ℹ️  Service worker already configured correctly${colors.reset}`);
  }
}

/**
 * Add client-side storage clearing helper
 */
function addStorageClearingHelper() {
  const libPath = path.join(__dirname, '..', 'src', 'lib');
  const authHelpersPath = path.join(libPath, 'auth-helpers.ts');
  
  // Ensure lib directory exists
  if (!fs.existsSync(libPath)) {
    fs.mkdirSync(libPath, { recursive: true });
  }
  
  const authHelpers = `/**
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
`;

  if (!fs.existsSync(authHelpersPath)) {
    fs.writeFileSync(authHelpersPath, authHelpers);
    console.log(`${colors.green}✅ Created authentication cache helpers${colors.reset}`);
  } else {
    console.log(`${colors.cyan}ℹ️  Authentication helpers already exist${colors.reset}`);
  }
}

/**
 * Update PWA installer to use auth helpers
 */
function updatePWAInstaller() {
  const pwaInstallerPath = path.join(__dirname, '..', 'src', 'components', 'mobile', 'PWAInstaller.tsx');
  
  if (!fs.existsSync(pwaInstallerPath)) {
    console.log(`${colors.yellow}⚠️  PWA installer not found, skipping update${colors.reset}`);
    return;
  }
  
  let pwaContent = fs.readFileSync(pwaInstallerPath, 'utf8');
  
  // Add auth helpers import if not present
  if (!pwaContent.includes('setupAuthCacheListener')) {
    const importStatement = `import { setupAuthCacheListener } from '@/lib/auth-helpers';\n`;
    
    // Add import after existing imports
    const lastImportIndex = pwaContent.lastIndexOf('import ');
    const nextLineIndex = pwaContent.indexOf('\n', lastImportIndex);
    
    pwaContent = pwaContent.slice(0, nextLineIndex + 1) + 
                importStatement + 
                pwaContent.slice(nextLineIndex + 1);
    
    // Add setup call in useEffect
    const useEffectRegex = /useEffect\(\(\) => \{/;
    if (useEffectRegex.test(pwaContent)) {
      pwaContent = pwaContent.replace(useEffectRegex, (match) => {
        return match + `\n    // Setup auth cache listener for login issues\n    setupAuthCacheListener();\n`;
      });
    }
    
    fs.writeFileSync(pwaInstallerPath, pwaContent);
    console.log(`${colors.green}✅ Updated PWA installer with auth cache listener${colors.reset}`);
  } else {
    console.log(`${colors.cyan}ℹ️  PWA installer already has auth cache listener${colors.reset}`);
  }
}

/**
 * Main execution
 */
function main() {
  try {
    fixServiceWorkerCaching();
    addStorageClearingHelper();
    updatePWAInstaller();
    
    console.log(`\n${colors.green}${colors.bold}✅ PWA CACHE SAFETY FIXES COMPLETE${colors.reset}`);
    console.log(`${colors.cyan}Login caching issues should be resolved.${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error applying PWA fixes: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
