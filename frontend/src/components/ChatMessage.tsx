
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type MessageRole = 'user' | 'assistant';

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  timestamp: Date;
  scriptureReference?: {
    text: string;
    source: string;
  };
}

const ChatMessage = ({ role, content, timestamp, scriptureReference }: ChatMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  
  const isUser = role === 'user';
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);

  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
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
      className={`mb-4 max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
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
          <div 
            className={`px-4 py-3 rounded-2xl ${
              isUser 
                ? 'bg-divine-600 text-white' 
                : 'glass-card dark:glass-dark'
            }`}
          >
            <div className="text-sm md:text-base whitespace-pre-wrap">{content}</div>
            
            {scriptureReference && (
              <div className="mt-3 pt-3 border-t border-divine-200/30 dark:border-divine-700/30">
                <button 
                  className="text-xs font-medium text-divine-300 dark:text-divine-400 hover:text-divine-200 dark:hover:text-divine-300 mb-1"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Hide Scripture Reference' : 'View Scripture Reference'}
                </button>
                
                {isExpanded && (
                  <div className="mt-2 text-sm bg-white/10 dark:bg-black/10 p-3 rounded-lg">
                    <blockquote className="italic text-divine-100 dark:text-divine-200">
                      "{scriptureReference.text}"
                    </blockquote>
                    <div className="mt-1 text-xs text-divine-300 dark:text-divine-400">
                      — {scriptureReference.source}
                    </div>
                  </div>
                )}
              </div>
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