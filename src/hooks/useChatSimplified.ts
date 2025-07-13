'use client';

import { useState, useCallback, useMemo } from 'react';
import { useChat as useAIChat } from 'ai/react';
import { useConcurrentExecutionManager } from '@/components/ui/ConcurrentExecutionManager';
import { toast } from 'sonner';
import safeLocalStorage, { getStoredJSON, setStoredJSON } from '@/lib/safeStorage';

export type AgentType = 'lexi' | 'alex' | 'rex';

// Message interface for chat functionality
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agent?: AgentType;
  ui_assets?: any;
}

export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
}

interface ConversationData {
  id: string;
  title: string;
  agent: AgentType;
  created_at: Date;
  updated_at: Date;
  messages: Message[];
  archived: boolean;
}

export interface ChatProgress {
  stage: string;
  progress: number;
  message: string;
  isGenerating: boolean;
  currentAgent?: AgentType;
}

export interface ChatConfig {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface ChatHookReturn {
  // Basic chat functionality
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setInput: (input: string) => void;
  isLoading: boolean;
  
  // Agent management
  currentAgent: AgentType;
  setCurrentAgent: (agent: AgentType) => void;
  
  // Chat state
  chatState: ChatState;
  setChatState: (state: Partial<ChatState>) => void;
  
  // Progress tracking
  chatProgress: ChatProgress;
  
  // Conversation management
  conversations: ConversationData[];
  createConversation: (agent: AgentType, title?: string) => string;
  archiveConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  loadConversation: (conversationId: string) => void;
  getCurrentConversation: () => ConversationData | undefined;
  
  // Message operations
  clearMessages: () => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  
  // Utility functions
  getConversationTitle: (agent: AgentType, firstMessage?: string) => string;
}

export const useChat = (): ChatHookReturn => {
  // Core AI chat hook
  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit: aiHandleSubmit,
    setInput,
    isLoading
  } = useAIChat({
    api: '/api/chat',
    initialMessages: [],
  });

  // Local state management
  const [currentAgent, setCurrentAgent] = useState<AgentType>('lexi');
  const [chatState, setChatStateInternal] = useState<ChatState>({
    isOpen: false,
    isMinimized: false
  });
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [chatProgress, setChatProgress] = useState<ChatProgress>({
    stage: 'ready',
    progress: 0,
    message: 'Ready to help',
    isGenerating: false,
  });

  // Transform AI messages to our Message format
  const messages: Message[] = useMemo(() => {
    return aiMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as 'user' | 'assistant',
      timestamp: msg.createdAt || new Date(),
      agent: currentAgent,
      ui_assets: undefined
    }));
  }, [aiMessages, currentAgent]);

  // Concurrent execution manager
  const { activeSessions } = useConcurrentExecutionManager();

  // Agent prefixes for conversation titles
  const agentPrefixes = {
    lexi: 'Onboarding',
    alex: 'Bidding',
    rex: 'Lead Gen'
  } as const;

  // Set chat state with persistence
  const setChatState = useCallback((newState: Partial<ChatState>) => {
    setChatStateInternal(prev => {
      const updated = { ...prev, ...newState };
      setStoredJSON('chat-state', updated);
      return updated;
    });
  }, []);

  // Create new conversation
  const createConversation = useCallback((agent: AgentType, title?: string): string => {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newConversation: ConversationData = {
      id: conversationId,
      title: title || `${agentPrefixes[agent]} Chat`,
      agent,
      created_at: new Date(),
      updated_at: new Date(),
      messages: [],
      archived: false
    };

    setConversations(prev => {
      const updated = [newConversation, ...prev];
      setStoredJSON('chat-conversations', updated);
      return updated;
    });

    setCurrentConversationId(conversationId);
    return conversationId;
  }, []);

  // Archive conversation
  const archiveConversation = useCallback((conversationId: string) => {
    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, archived: true, updated_at: new Date() }
          : conv
      );
      setStoredJSON('chat-conversations', updated);
      return updated;
    });

    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }

    toast.success('Conversation archived');
  }, [currentConversationId]);

  // Delete conversation
  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== conversationId);
      setStoredJSON('chat-conversations', updated);
      return updated;
    });

    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }

    toast.success('Conversation deleted');
  }, [currentConversationId]);

  // Load conversation
  const loadConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Note: In a full implementation, this would reload messages from the conversation
    // For now, we maintain the current messages array
  }, []);

  // Get current conversation
  const getCurrentConversation = useCallback((): ConversationData | undefined => {
    if (!currentConversationId) return undefined;
    return conversations.find(conv => conv.id === currentConversationId);
  }, [currentConversationId, conversations]);

  // Generate conversation title
  const getConversationTitle = useCallback((agent: AgentType, firstMessage?: string): string => {
    const prefix = agentPrefixes[agent];
    if (!firstMessage) return `${prefix} Chat`;
    
    const truncated = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;
    
    return `${prefix}: ${truncated}`;
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    // Clear current conversation's messages
    if (currentConversationId) {
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, messages: [], updated_at: new Date() }
            : conv
        );
        setStoredJSON('chat-conversations', updated);
        return updated;
      });
    }
  }, [currentConversationId]);

  // Add message
  const addMessage = useCallback((messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // If no current conversation, create one
    if (!currentConversationId) {
      const title = getConversationTitle(currentAgent, messageData.content);
      createConversation(currentAgent, title);
    }

    // Add message to current conversation
    if (currentConversationId) {
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === currentConversationId
            ? { 
                ...conv, 
                messages: [...conv.messages, newMessage],
                updated_at: new Date()
              }
            : conv
        );
        setStoredJSON('chat-conversations', updated);
        return updated;
      });
    }
  }, [currentConversationId, currentAgent, createConversation, getConversationTitle]);

  // Handle form submission with agent context
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Add user message to conversation
    if (input.trim()) {
      addMessage({
        content: input,
        role: 'user',
        agent: currentAgent
      });
    }

    // Update progress
    setChatProgress({
      stage: 'processing',
      progress: 25,
      message: `${currentAgent.toUpperCase()} is thinking...`,
      isGenerating: true,
      currentAgent
    });

    // Submit to AI
    aiHandleSubmit(e);
  }, [aiHandleSubmit, input, addMessage, currentAgent]);

  // Load persisted data on mount
  useMemo(() => {
    try {
      // Load chat state using safe storage
      const parsedState = getStoredJSON<ChatState>('chat-state', {} as ChatState);
      if (Object.keys(parsedState).length > 0) {
        setChatStateInternal(parsedState);
      }

      // Load conversations using safe storage
      const parsedConversations = getStoredJSON<ConversationData[]>('chat-conversations', []);
      if (parsedConversations.length > 0) {
        setConversations(parsedConversations);
      }
    } catch (error) {
      console.error('Error loading persisted chat data:', error);
    }
  }, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
    currentAgent,
    setCurrentAgent,
    chatState,
    setChatState,
    chatProgress,
    conversations,
    createConversation,
    archiveConversation,
    deleteConversation,
    loadConversation,
    getCurrentConversation,
    clearMessages,
    addMessage,
    getConversationTitle
  };
};
