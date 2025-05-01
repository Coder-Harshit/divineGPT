export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    scriptureReference?: {
      text: string;
      source: string;
    };
    isReframing?: boolean; // Add this line
  };
  
  // This represents a message as stored in Supabase's JSONB column (with string timestamp)
  export type MessageJson = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    scriptureReference?: {
      text: string;
      source: string;
    };
    isReframing?: boolean; // Add this line
  };
  
  export type Conversation = {
    id: string;
    user_id: string;
    title: string;
    messages: Message[];
    preview?: string;
    timestamp: Date;
    summary?: string;
  };
  
  export type ConversationRow = {
    id: string;
    user_id: string;
    title: string;
    messages: MessageJson[];
    preview?: string;
    timestamp: string;
  };
  
  // Update the Database type to include conversations
  export type Database = {
    public: {
      Tables: {
        conversations: {
          Row: {
            id: string;
            user_id: string;
            title: string;
            messages: MessageJson[];
            preview?: string;
            timestamp: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            title: string;
            messages?: MessageJson[];
            preview?: string;
            timestamp?: string;
          };
          Update: {
            id?: string;
            user_id?: string;
            title?: string;
            messages?: MessageJson[];
            preview?: string;
            timestamp?: string;
          };
        };
      };
    };
  };