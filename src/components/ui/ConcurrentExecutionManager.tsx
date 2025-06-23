'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/providers/UserProvider';

export interface ExecutionSession {
  id: string;
  agent: 'alex' | 'rex';
  user_id: string;
  started_at: Date;
  estimated_duration: number;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  progress: number;
  current_task: string;
}

interface ConcurrentExecutionContextType {
  activeSessions: ExecutionSession[];
  canStartNew: boolean;
  startExecution: (agent: 'alex' | 'rex', estimatedDuration?: number) => Promise<string | null>;
  updateExecution: (id: string, updates: Partial<ExecutionSession>) => void;
  cancelExecution: (id: string) => void;
  completeExecution: (id: string) => void;
  getQueuePosition: () => number;
}

// Maximum concurrent executions per user (any tier)
const MAX_CONCURRENT_EXECUTIONS = 2;

// Execution timeout (10 minutes)
const EXECUTION_TIMEOUT = 10 * 60 * 1000;

export function useConcurrentExecutionManager(): ConcurrentExecutionContextType {
  const { user } = useUser();
  const [activeSessions, setActiveSessions] = useState<ExecutionSession[]>([]);
  const [queuedRequests, setQueuedRequests] = useState<Array<{
    agent: 'alex' | 'rex';
    estimatedDuration: number;
    resolve: (id: string | null) => void;
  }>>([]);

  // Auto-cleanup completed/failed sessions
  useEffect(() => {
    const cleanup = setInterval(() => {
      setActiveSessions(prev => 
        prev.filter(session => 
          session.status === 'running' && 
          (Date.now() - session.started_at.getTime()) < EXECUTION_TIMEOUT
        )
      );
    }, 30000); // Check every 30 seconds

    return () => clearInterval(cleanup);
  }, []);  // Process queued requests when slots become available
  useEffect(() => {
    if (activeSessions.length < MAX_CONCURRENT_EXECUTIONS && queuedRequests.length > 0) {
      const nextRequest = queuedRequests[0];
      setQueuedRequests(prev => prev.slice(1));
      
      // Create execution session directly here to avoid circular dependency
      if (user) {
        const session: ExecutionSession = {
          id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          agent: nextRequest.agent,
          user_id: user.id,
          started_at: new Date(),
          estimated_duration: nextRequest.estimatedDuration,
          status: 'running',
          progress: 0,
          current_task: `Starting ${nextRequest.agent} execution...`
        };

        setActiveSessions(prev => [...prev, session]);
        nextRequest.resolve(session.id);
      } else {
        nextRequest.resolve(null);
      }
    }
  }, [activeSessions.length, queuedRequests, user]);

  const startExecutionInternal = useCallback(async (
    agent: 'alex' | 'rex', 
    estimatedDuration: number = 120000 // 2 minutes default
  ): Promise<string | null> => {
    if (!user) return null;

    const session: ExecutionSession = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agent,
      user_id: user.id,
      started_at: new Date(),
      estimated_duration: estimatedDuration,
      status: 'running',
      progress: 0,
      current_task: `Starting ${agent} execution...`
    };

    setActiveSessions(prev => [...prev, session]);

    // Auto-timeout after specified duration
    setTimeout(() => {
      setActiveSessions(prev => 
        prev.map(s => 
          s.id === session.id && s.status === 'running'
            ? { ...s, status: 'failed', current_task: 'Execution timeout' }
            : s
        )
      );
    }, EXECUTION_TIMEOUT);

    return session.id;
  }, [user]);

  const startExecution = useCallback(async (
    agent: 'alex' | 'rex', 
    estimatedDuration: number = 120000
  ): Promise<string | null> => {
    if (!user) return null;

    // Check if we can start immediately
    if (activeSessions.length < MAX_CONCURRENT_EXECUTIONS) {
      return startExecutionInternal(agent, estimatedDuration);
    }

    // Queue the request
    return new Promise((resolve) => {
      setQueuedRequests(prev => [...prev, { agent, estimatedDuration, resolve }]);
    });
  }, [user, activeSessions.length, startExecutionInternal]);

  const updateExecution = useCallback((id: string, updates: Partial<ExecutionSession>) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === id 
          ? { ...session, ...updates }
          : session
      )
    );
  }, []);

  const cancelExecution = useCallback((id: string) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === id 
          ? { ...session, status: 'cancelled', current_task: 'Cancelled by user' }
          : session
      )
    );
  }, []);

  const completeExecution = useCallback((id: string) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === id 
          ? { 
              ...session, 
              status: 'completed', 
              progress: 100,
              current_task: 'Completed successfully'
            }
          : session
      )
    );

    // Remove completed session after a short delay for UI feedback
    setTimeout(() => {
      setActiveSessions(prev => prev.filter(s => s.id !== id));
    }, 3000);
  }, []);

  const getQueuePosition = useCallback(() => {
    return queuedRequests.length;
  }, [queuedRequests.length]);

  const canStartNew = activeSessions.length < MAX_CONCURRENT_EXECUTIONS;

  return {
    activeSessions,
    canStartNew,
    startExecution,
    updateExecution,
    cancelExecution,
    completeExecution,
    getQueuePosition
  };
}

// React Context for global access
import { createContext, useContext, ReactNode } from 'react';

const ConcurrentExecutionContext = createContext<ConcurrentExecutionContextType | null>(null);

export function ConcurrentExecutionProvider({ children }: { children: ReactNode }) {
  const executionManager = useConcurrentExecutionManager();

  return (
    <ConcurrentExecutionContext.Provider value={executionManager}>
      {children}
    </ConcurrentExecutionContext.Provider>
  );
}

export function useExecutionManager(): ConcurrentExecutionContextType {
  const context = useContext(ConcurrentExecutionContext);
  if (!context) {
    throw new Error('useExecutionManager must be used within ConcurrentExecutionProvider');
  }
  return context;
}
