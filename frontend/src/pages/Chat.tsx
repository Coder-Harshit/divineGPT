import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import ChatContainer from '@/components/ChatContainer';
import ChatHistory from '@/components/ChatHistory';
import { Conversation } from '@/types/chat';
import { fetchAllConversations, fetchConversation, deleteConversation } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';

const ChatPage = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllConversations();
      setConversations(data);
    } catch (error) {
      toast({
        title: 'Error loading conversations',
        description: 'There was an error loading your conversations. Please try again later.',
        variant: 'destructive',
      });
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try{
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversation === id) {
        setActiveConversation(null);
      }
      fetchAllConversations();
      toast({
        title: "Success",
        description: "Conversation deleted successfully.",
      });
  } catch (error) {
    toast({
      title: "Error",
      description: "There was an error deleting the conversation. Please try again later.",
      variant: "destructive"
    });
    console.error("Error deleting conversation:", error);
  }
};

  const handleNewChat = () => {
    setActiveConversation(null);
// setConversations([]);
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 pt-20 md:pt-24 pb-0 md:pb-6 max-w-7xl mx-auto w-full px-0 md:px-4 flex flex-col">
        <div className="flex flex-1 min-h-0 rounded-xl overflow-hidden glass-card">
          {/* Sidebar - overlays on mobile, static on desktop */}
          <div
            className={`
              fixed inset-0 z-40 bg-black/40 transition-opacity md:static md:z-auto md:bg-transparent
              ${showHistory ? 'block' : 'hidden'} md:block
            `}
            onClick={() => setShowHistory(false)}
          >
            <div
              className="absolute md:static left-0 top-0 h-full w-72 max-w-full border-r border-divine-100 dark:border-divine-800 overflow-y-auto p-4"
              onClick={e => e.stopPropagation()}
            >
              <ChatHistory
                conversations={conversations}
                onSelect={id => {
                  setActiveConversation(id);
                  setShowHistory(false);
                }}
                onDelete={handleDeleteConversation}
                active={activeConversation}
                onNewChat={handleNewChat}
                isLoading={isLoading}
              />
            </div>
          </div>
          {/* Main Chat Area */}
            {!showHistory && (
            <div className={`flex-1 flex flex-col min-h-0 bg-background`}>
              <ChatContainer
              onToggleHistory={toggleHistory}
              showHistory={showHistory}
              conversationId={activeConversation || undefined}
              onConversationCreated={id => {
                loadConversations();
                setActiveConversation(id);
              }}
              />
            </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default ChatPage;