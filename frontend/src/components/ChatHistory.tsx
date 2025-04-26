import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, MessageSquare, Plus } from 'lucide-react';
import Button from './Button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Conversation, ConversationRow } from '@/types/chat';
import { mapConversation } from '@/services/chatService';

interface ChatHistoryProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  active: string | null;
  onNewChat?: () => void;
  isLoading?: boolean;
}

// const ChatHistory = ({ conversations: propConversations, onSelect, onDelete, active, onNewChat }: ChatHistoryProps) => {
const ChatHistory = ({
  conversations,
  onSelect,
  onDelete,
  active,
  onNewChat,
  isLoading = false
}: ChatHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // const [conversations, setConversations] = useState<Conversation[]>(propConversations);
  // const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setConversations(propConversations);
  // }, [propConversations]);

  // const handleDelete = async (e: React.MouseEvent, id: string) => {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      // @ts-expect-error TS2589: Type instantiation is excessively deep and possibly infinite.

      // First, delete emotional_journey entries
      const {error: ejError } = await supabase
        .from('emotional_journey')
        .delete()
        .eq('conversation_id', id);
      if (ejError) throw ejError;
    
      // Then, delete the conversation
      const { error: convoError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
      if (convoError) throw convoError;

      // const qry = supabase.from('emotional_journey')
      //   .delete() as any;
      // qry.eq('conversation_id', id);
      // // const { err } = qry.eq('conversation_id', id);
      // // if (err) throw err;
      // const convo_del = supabase.from('conversations').delete();
      // convo_del.eq('id', id);
      // if (error) throw error;
      // const { error } = await supabase
      //   .from('conversations')
      //   .delete()
      //   .eq('id', id);
      // if (error) throw error;

      onDelete(id);
      // setConversations(conversations.filter(conv => conv.id !== id));
      // toast({
      //   title: "Success",
      //   description: "Conversation deleted",
      // });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-sanskrit text-lg font-medium">Recent Conversations</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onNewChat?.()}
        >
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex space-x-2">
            <div className="h-2 w-2 rounded-full bg-divine-500 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-divine-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 rounded-full bg-divine-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      ) : conversations.length === 0 ? (
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
              className={`glass-card p-3 rounded-lg cursor-pointer transition-all hover:shadow-md border ${active === conversation.id
                ? 'border-divine-300 dark:border-divine-700 bg-divine-50/10 dark:bg-divine-900/10'
                : 'border-transparent'
                }`}
              onClick={() => onSelect(conversation.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{conversation.title || 'Untitled'}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {conversation.timestamp ? conversation.timestamp.toLocaleDateString() : ''}
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
                className={`mt-2 text-xs text-muted-foreground line-clamp-2 ${expandedId === conversation.id ? 'line-clamp-none' : ''
                  }`}
              >
                {conversation.preview || ''}
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