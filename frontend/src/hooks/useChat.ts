import { useState } from 'react';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { microserviceApi, DivineResponse } from '@/services/microserviceApi';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processUserMessage = async (
    content: string, 
    userTone: string,
    onMessageCreated: (message: Message) => void,
    onResponseReceived: (response: Message, emotion: string) => void
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Create user message
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      // Callback to add the message to state
      onMessageCreated(newMessage);
      
      // Call API for response
      const divineResponse = await microserviceApi.askDivineQuestion(content, userTone);
      const llmResponse = divineResponse.llm_response;
      
      // Create assistant message with response
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: llmResponse.response,
        timestamp: new Date(),
        scriptureReference: {
          text: llmResponse.shloka,
          source: llmResponse.meaning
        }
      };
      
      // Callback to add response and emotion to state
      onResponseReceived(responseMessage, llmResponse.emotion);
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processUserMessage
  };
};