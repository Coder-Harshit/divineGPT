import { supabase } from '@/integrations/supabase/client';
import { Message, MessageJson, Conversation, ConversationRow } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

// Helper to convert database timestamp to Date object
const convertTimestamp = (timestamp: string): Date => new Date(timestamp);

// Helper to convert Message to MessageJson (for database storage)
const messageToJson = (message: Message): MessageJson => ({
  ...message,
  timestamp: message.timestamp.toISOString()
});

// Helper to convert MessageJson to Message (for frontend use)
const jsonToMessage = (json: MessageJson): Message => ({
  ...json,
  timestamp: new Date(json.timestamp)
});

// Convert database row to frontend Conversation type
export const mapConversation = (row: ConversationRow): Conversation => ({
  ...row,
  timestamp: convertTimestamp(row.timestamp),
  messages: row.messages.map(jsonToMessage)
});

export const fetchAllConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return (data as ConversationRow[]).map(mapConversation);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Fetch a specific conversation by ID
export const fetchConversation = async (id?: string): Promise<Conversation | null> => {
  try {
    if (!id) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data ? mapConversation(data as ConversationRow) : null;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
};

// Delete a conversation by ID
export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};

// Delete all conversations
export const deleteAllConversations = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting all conversations:', error);
    return false;
  }
};


// // Fetch a specific conversation by ID
// export const fetchConversation = async (id: string): Promise<Conversation | ConversationRow[] | null> => {
//   try {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return null;

//     if (id) {

//       const { data, error } = await supabase
//         .from('conversations')
//         .select('*')
//         .eq('id', id)
//         .eq('user_id', user.id)
//         .single();

//       if (error) throw error;

//       return data ? mapConversation(data as ConversationRow) : null;
//     }
//   } catch (error) {
//     console.error('Error fetching conversation:', error);
//     return null;
//   }
// };

// Save a new conversation
export const saveConversation = async (
  title: string,
  messages: Message[]
): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const preview = messages[0]?.content?.substring(0, 100) || 'New conversation';

    // Convert Message[] to MessageJson[] for storage
    const jsonMessages = messages.map(messageToJson);

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: title || 'New conversation',
        messages: jsonMessages,
        preview: preview
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    toast({
      title: "Error",
      description: "Failed to save conversation",
      variant: "destructive"
    });
    return null;
  }
};

// Update an existing conversation
export const updateConversation = async (
  id: string,
  messages: Message[]
): Promise<boolean> => {
  try {
    // Convert Message[] to MessageJson[] for storage
    const jsonMessages = messages.map(messageToJson);

    const { error } = await supabase
      .from('conversations')
      .update({ messages: jsonMessages })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating conversation:', error);
    toast({
      title: "Error",
      description: "Failed to update conversation",
      variant: "destructive"
    });
    return false;
  }
};

// Save user's emotional journey
export const saveEmotionalJourney = async (
  content: string,
  emotion: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    await supabase.from('emotional_journey').insert({
      user_id: user.id,
      emotion,
      message: content
    });

    return true;
  } catch (error) {
    console.error('Error saving emotional journey:', error);
    return false;
  }
};