
import { useState } from 'react';
import NavBar from '@/components/NavBar';
import ChatContainer from '@/components/ChatContainer';
import ChatHistory from '@/components/ChatHistory';

const ChatPage = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  
  // Mock conversation history data
  const [conversations, setConversations] = useState([
    {
      id: '1',
      title: 'Finding inner peace',
      timestamp: new Date(Date.now() - 3600000 * 24),
      preview: 'Our discussion about finding inner peace through meditation and the teachings of the Bhagavad Gita.'
    },
    {
      id: '2',
      title: 'Dealing with loss',
      timestamp: new Date(Date.now() - 3600000 * 48),
      preview: 'Wisdom from the Ramayana on handling grief and loss in our lives. The story of Rama teaches us resilience.'
    },
  ]);

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 pt-24 pb-6 max-w-7xl mx-auto w-full px-4">
        <div className="flex h-[calc(100vh-12rem)] rounded-xl overflow-hidden glass-card">
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
            />
          </div>
          
          {/* Main Chat Area */}
          <div className={`${showHistory ? 'hidden md:block md:flex-1' : 'flex-1'} flex flex-col`}>
            <ChatContainer 
              onToggleHistory={toggleHistory} 
              showHistory={showHistory}
              conversationId={activeConversation || undefined}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
