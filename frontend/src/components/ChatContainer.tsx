import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, BookOpen } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ScriptureSelector from './ScriptureSelector';
import ToneSetter from './ToneSetter';
import Button from './Button';
import MicroserviceHealth from './MicroserviceHealth';
import { toast } from '@/hooks/use-toast';
import { Message } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { fetchConversation, saveConversation, updateConversation, saveEmotionalJourney } from '@/services/chatService';

interface ChatContainerProps {
  onToggleHistory: () => void;
  showHistory: boolean;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

const ChatContainer = ({ onToggleHistory, showHistory, conversationId, onConversationCreated }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedScripture, setSelectedScripture] = useState('all');
  const [moodHistory, setMoodHistory] = useState<{ timestamp: Date; emotion: string }[]>([]);
  const [userTone, setUserTone] = useState<'mature' | 'neutral' | 'genz'>('genz');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoading, processUserMessage } = useChat();

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    const conversation = await fetchConversation(id);
    if (conversation) {
      setMessages(conversation.messages);
    }
  };

  const handleSendMessage = async (content: string) => {
    await processUserMessage(
      content,
      userTone,
      // Handle new user message
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      },
      // Handle assistant response
      async (responseMessage, emotion) => {
        setMessages(prev => {
          const updatedMessages = [...prev, responseMessage];

          if (conversationId) {
            // Track emotional journey
            saveEmotionalJourney(content, emotion, conversationId);
            // Update existing conversation
            updateConversation(conversationId, updatedMessages);
          } else {
            // Create new conversation
            const title = content.length > 30 ? 
              content.substring(0, 30) + '...' : 
              content;
            saveConversation(title, updatedMessages).then(newConversationId => {
              if (newConversationId) {
                if (onConversationCreated) {
                  saveEmotionalJourney(content, emotion, newConversationId);
                  onConversationCreated(newConversationId);
                }
              }
            });
          }

          return updatedMessages;
        });
      }
    );
  };

  const handleScriptureSelect = (scripture: string) => {
    setSelectedScripture(scripture);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="glass-card p-3 md:p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-2 md:hidden"
            onClick={onToggleHistory}
          >
            {showHistory ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            <span className="sr-only">
              {showHistory ? 'Close history' : 'Show history'}
            </span>
          </Button>
          
          <h2 className="text-lg font-sanskrit font-medium flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-divine-600 dark:text-divine-400" />
            Divine Guidance
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <MicroserviceHealth />
          <ToneSetter currentTone={userTone} onToneChange={setUserTone} />
          <ScriptureSelector onSelect={handleScriptureSelect} selected={selectedScripture} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto p-2 md:p-4 space-y-4 min-h-0 snap-x">
        <div className="flex flex-col w-full md:w-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="h-20 w-20 text-divine-500/50 dark:text-divine-400/50 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50s50-22.4,50-50S77.6,0,50,0z M76.7,56.7c-0.9,3.5-2.5,6.7-4.7,9.4 c-2.2,2.7-4.9,4.9-8.1,6.4c-3.2,1.5-6.8,2.3-10.8,2.3c-4.2,0-7.9-0.8-11.2-2.3c-3.3-1.6-6.1-3.7-8.3-6.4c-2.3-2.7-4-5.9-5.2-9.4 c-1.2-3.6-1.8-7.5-1.8-11.5c0-4.1,0.6-8,1.8-11.6c1.2-3.6,2.9-6.8,5.2-9.5c2.3-2.7,5.1-4.9,8.4-6.4c3.3-1.6,7.1-2.4,11.2-2.4 c3.9,0,7.4,0.8,10.6,2.4c3.2,1.6,5.9,3.7,8.1,6.4c2.2,2.7,3.9,5.9,5,9.5c1.1,3.6,1.7,7.5,1.7,11.6C78.5,49.3,77.6,53.2,76.7,56.7z" />
                  <path d="M50.8,25.8c-2.1,0-3.9,0.3-5.4,0.9c-1.5,0.6-2.7,1.4-3.7,2.4c-0.9,1-1.6,2.2-2,3.6c-0.4,1.4-0.6,2.8-0.6,4.4 c0,1.6,0.2,3,0.6,4.4c0.4,1.4,1,2.6,1.9,3.6c0.9,1,2.1,1.8,3.6,2.4c1.5,0.6,3.3,0.9,5.5,0.9c2.2,0,4-0.3,5.5-0.9 c1.5-0.6,2.7-1.4,3.6-2.4c0.9-1,1.6-2.2,1.9-3.6c0.4-1.4,0.6-2.8,0.6-4.4c0-1.5-0.2-3-0.6-4.4c-0.4-1.4-1-2.6-1.9-3.6 c-0.9-1-2.1-1.8-3.6-2.4C54.8,26.1,53,25.8,50.8,25.8z" />
                </svg>
              </div>
              <h3 className="font-sanskrit text-xl mb-3 text-center">Welcome to DivineGPT</h3>
              <p className="text-center text-muted-foreground max-w-md">
                Ask any question and receive guidance inspired by Hindu scriptures like the Bhagavad Gita and Ramayana.
              </p>
              <div className="mt-8 space-y-3 w-full max-w-md">
                <button 
                  onClick={() => handleSendMessage("How can I find inner peace during difficult times?")}
                  className="w-full text-left p-3 rounded-lg glass-card hover:bg-divine-50/10 dark:hover:bg-divine-900/10 transition-all"
                >
                  <p className="text-sm">How can I find inner peace during difficult times?</p>
                </button>
                <button 
                  onClick={() => handleSendMessage("What does the Bhagavad Gita say about purpose in life?")}
                  className="w-full text-left p-3 rounded-lg glass-card hover:bg-divine-50/10 dark:hover:bg-divine-900/10 transition-all"
                >
                  <p className="text-sm">What does the Bhagavad Gita say about purpose in life?</p>
                </button>
                <button 
                  onClick={() => handleSendMessage("How do I deal with anxiety according to Hindu teachings?")}
                  className="w-full text-left p-3 rounded-lg glass-card hover:bg-divine-50/10 dark:hover:bg-divine-900/10 transition-all"
                >
                  <p className="text-sm">How do I deal with anxiety according to Hindu teachings?</p>
                </button>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <div className="snap-start">
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  scriptureReference={message.scriptureReference}
                />
              </div>
            ))
          )}
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-2 pl-12">
            <div className="h-2 w-2 rounded-full bg-divine-500 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-divine-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 rounded-full bg-divine-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatContainer;