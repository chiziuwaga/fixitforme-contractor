'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { Message } from '../UnifiedChatInterface';

interface MessagesContainerProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessagesContainer({ messages, isLoading }: MessagesContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 md:p-6 space-y-6">
            {messages.map((message, index) => (
                <MessageBubble 
                    key={message.id} 
                    message={message}
                    isLoading={isLoading && index === messages.length - 1}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    </ScrollArea>
  );
}
