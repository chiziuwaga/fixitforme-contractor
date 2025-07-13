/**
 * SafeLocalStorage - Handles localStorage with graceful fallbacks for iPhone/Safari issues
 */

type SafeStorageData = Record<string, string>;

class SafeLocalStorage {
  private memoryFallback: SafeStorageData = {};
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('[SafeLocalStorage] localStorage not available, using memory fallback:', error);
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isAvailable) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn(`[SafeLocalStorage] Error reading ${key}:`, error);
      }
    }
    
    return this.memoryFallback[key] || null;
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn(`[SafeLocalStorage] Error writing ${key}:`, error);
      }
    }
    
    // Fallback to memory storage
    this.memoryFallback[key] = value;
  }

  removeItem(key: string): void {
    if (this.isAvailable) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`[SafeLocalStorage] Error removing ${key}:`, error);
      }
    }
    
    delete this.memoryFallback[key];
  }

  clear(): void {
    if (this.isAvailable) {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('[SafeLocalStorage] Error clearing localStorage:', error);
      }
    }
    
    this.memoryFallback = {};
  }
}

// Singleton instance
const safeLocalStorage = new SafeLocalStorage();

export default safeLocalStorage;

// Helper functions for common patterns
export const getStoredJSON = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = safeLocalStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`[SafeLocalStorage] Error parsing JSON for ${key}:`, error);
    return defaultValue;
  }
};

export const setStoredJSON = (key: string, value: unknown): void => {
  try {
    safeLocalStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[SafeLocalStorage] Error storing JSON for ${key}:`, error);
  }
};
