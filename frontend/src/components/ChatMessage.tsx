import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AudioController from './AudioController';

type MessageRole = 'user' | 'assistant';

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  timestamp: Date;
  scriptureReference?: {
    text: string;
    source: string;
    transliteration?: string;
  };
  isReframing?: boolean; // Add this line
}

const ChatMessage = ({ role, content, timestamp, scriptureReference, isReframing = false }: ChatMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const messageRef = useRef<HTMLDivElement>(null);
  
  const isUser = role === 'user';
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);

  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={bubbleVariants}
      ref={messageRef}
      className={`mb-4 max-w-full md:max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
    >
      <div className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="flex-shrink-0 mr-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-divine-500 to-divine-700 flex items-center justify-center text-white font-sanskrit">
              ॐ
            </div>
          </div>
        )}
        
        <div className="flex flex-col">
          {isReframing && !isUser && (
            <div className="text-xs text-divine-500 mb-1 ml-1">
              Reframing previous answer
            </div>
          )}
          <div 
            className={`px-4 py-3 rounded-2xl ${
              isUser 
                ? 'bg-divine-600 text-white' 
                : `glass-card dark:glass-dark ${isReframing ? 'border-l-2 border-divine-500' : ''}`
            }`}
          >
            <div className="text-sm md:text-base whitespace-pre-wrap">{content}</div>
            
            {/* Audio controls for assistant messages */}
            {!isUser && (
              <div className="mt-2">
                <AudioController text={content} />
              </div>
            )}
            
            {scriptureReference && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-3 pt-3 border-t border-divine-200/30 dark:border-divine-700/30"
              >
                <button 
                  className="text-xs font-medium text-divine-300 dark:text-divine-400 hover:text-divine-200 dark:hover:text-divine-300 mb-2"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Hide Scripture Reference' : 'View Scripture Reference'}
                </button>
                
                {isExpanded && (
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="bg-white/10 dark:bg-black/10 p-4 rounded-lg">
                      <blockquote className="font-sanskrit text-sm text-divine-100 dark:text-divine-200 mb-3">
                        {scriptureReference.text}
                      </blockquote>
                      <div className="text-sm text-divine-200 dark:text-divine-300 mb-2">
                        {scriptureReference.source}
                      </div>
                      {scriptureReference.transliteration && (
                        <div className="text-xs text-divine-300/80 dark:text-divine-400/80 italic">
                          {scriptureReference.transliteration}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
          
          <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 ml-3">
            <div className="h-9 w-9 rounded-full bg-divine-200 dark:bg-divine-800 flex items-center justify-center text-divine-700 dark:text-divine-300">
              <span className="text-sm font-medium">You</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;