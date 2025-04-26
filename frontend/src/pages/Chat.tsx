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
  
  // // Mock conversation history data
  // const [conversations, setConversations] = useState([
  //   {
  //     id: '1',
  //     title: 'Finding inner peace',
  //     timestamp: new Date(Date.now() - 3600000 * 24),
  //     preview: 'Our discussion about finding inner peace through meditation and the teachings of the Bhagavad Gita.'
  //   },
  //   {
  //     id: '2',
  //     title: 'Dealing with loss',
  //     timestamp: new Date(Date.now() - 3600000 * 48),
  //     preview: 'Wisdom from the Ramayana on handling grief and loss in our lives. The story of Rama teaches us resilience.'
  //   },
  // ]);

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
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* <main className="flex-1 pt-24 pb-6 max-w-7xl mx-auto w-full px-4"> */}
      <main className="flex-1 pt-24 pb-6 max-w-7xl mx-auto w-full px-4 flex flex-col">
        {/* <div className="flex h-[calc(100vh-12rem)] rounded-xl overflow-hidden glass-card"> */}
        <div className="flex flex-1 rounded-xl overflow-hidden glass-card min-h-0">
          {/* Sidebar - Chat History */}
          <div 
            className={`w-72 border-r border-divine-100 dark:border-divine-800 ${
              showHistory ? 'block' : 'hidden'
            } md:block transition-all duration-300 ease-in-out overflow-y-auto p-4`}
          >
            <ChatHistory 
              conversations={conversations}
              onSelect={(id) => setActiveConversation(id)}
              onDelete={handleDeleteConversation}
              active={activeConversation}
              onNewChat={handleNewChat}
              isLoading={isLoading}
            />
          </div>
          
          {/* Main Chat Area */}
          <div className={`${showHistory ? 'hidden md:block md:flex-1' : 'flex-1'} flex flex-col min-h-0`}>
            <ChatContainer 
              onToggleHistory={toggleHistory} 
              showHistory={showHistory}
              conversationId={activeConversation || undefined}
              onConversationCreated={(id) => {
                loadConversations();
                setActiveConversation(id);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;