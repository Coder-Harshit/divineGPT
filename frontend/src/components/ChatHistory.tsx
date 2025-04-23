
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, MessageSquare } from 'lucide-react';
import Button from './Button';

interface ChatHistoryProps {
  conversations: {
    id: string;
    title: string;
    timestamp: Date;
    preview: string;
  }[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  active: string | null;
}

const ChatHistory = ({ conversations, onSelect, onDelete, active }: ChatHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="space-y-3">
      <h2 className="font-sanskrit text-lg font-medium mb-4">Recent Conversations</h2>
      
      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-3 text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground">
            Start a new conversation to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`glass-card p-3 rounded-lg cursor-pointer transition-all hover:shadow-md border ${
                active === conversation.id 
                  ? 'border-divine-300 dark:border-divine-700 bg-divine-50/10 dark:bg-divine-900/10' 
                  : 'border-transparent'
              }`}
              onClick={() => onSelect(conversation.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{conversation.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {conversation.timestamp.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0.5 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(e, conversation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
              
              <div
                className={`mt-2 text-xs text-muted-foreground line-clamp-2 ${
                  expandedId === conversation.id ? 'line-clamp-none' : ''
                }`}
              >
                {conversation.preview}
              </div>
              
              <button
                className="mt-1 text-xs text-divine-600 hover:text-divine-700 dark:text-divine-400 dark:hover:text-divine-300 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(expandedId === conversation.id ? null : conversation.id);
                }}
              >
                {expandedId === conversation.id ? 'Show less' : 'Show more'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;