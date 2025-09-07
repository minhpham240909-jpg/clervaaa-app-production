'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ThumbsUp, ThumbsDown, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { AIErrorBoundary } from '@/components/boundary/AIErrorBoundary';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  helpful?: boolean;
  context?: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: 'general' | 'study_plan' | 'subject_help' | 'motivation';
}

export default function AIChatbot({ isOpen, onClose, initialContext = 'general' }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm StudyBot, your AI study assistant. I can help you with study planning, subject questions, motivation, and more. What would you like to work on today?",
      isBot: true,
      timestamp: new Date(),
      context: 'general',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(initialContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: {
            type: context,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isBot: true,
        timestamp: new Date(data.timestamp),
        context: data.context,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      logger.error('Chat error', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to get response from StudyBot');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const provideFeedback = async (messageId: string, helpful: boolean) => {
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          helpful,
        }),
      });

      setMessages(prev =>
        prev.map((msg: any) =>
          msg.id === messageId ? { ...msg, helpful } : msg
        )
      );

      toast.success(`Thank you for your feedback!`);
    } catch (error) {
      logger.error('Feedback error', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to record feedback');
    }
  };

  const contextOptions = [
    { value: 'general', label: 'General Help', icon: Bot },
    { value: 'study_plan', label: 'Study Planning', icon: Sparkles },
    { value: 'subject_help', label: 'Subject Help', icon: User },
    { value: 'motivation', label: 'Motivation', icon: ThumbsUp },
  ];

  if (!isOpen) return null;

  return (
    <AIErrorBoundary>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">StudyBot</h3>
              <p className="text-sm text-gray-500">AI Study Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Context Selector */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex space-x-2 overflow-x-auto">
            {contextOptions.map((option: any) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setContext(option.value as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    context === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message: any) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.isBot && (
                      <Bot className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Feedback buttons for bot messages */}
                  {message.isBot && message.helpful === undefined && (
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">Was this helpful?</span>
                      <button
                        onClick={() => provideFeedback(message.id, true)}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => provideFeedback(message.id, false)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* Feedback confirmation */}
                  {message.isBot && message.helpful !== undefined && (
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {message.helpful ? 'Thanks for the positive feedback!' : 'Thanks for the feedback!'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">StudyBot is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e: any) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about studying..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </motion.div>
    </AIErrorBoundary>
  );
}