import { useState } from 'react';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { microserviceApi, DivineResponse } from '@/services/microserviceApi';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processUserMessage = async (
    content: string,
    userTone: string,
    history: Message[],
    previousSummary: string | undefined, // Add previousSummary parameter
    onMessageCreated: (message: Message) => void,
    // Update callback signature to include newSummary
    onResponseReceived: (responseMessage: Message, emotion: string, newSummary: string) => void
  ): Promise<void> => {
    setIsLoading(true);

    // Check if this is potentially a meta-request
    const metaRequestPatterns = [
      "reframe", "explain differently", "clarify", "simplify", 
      "elaborate", "what do you mean", "can you rephrase"
    ];
    
    const isMetaRequest = metaRequestPatterns.some(pattern => 
      content.toLowerCase().includes(pattern)
    );

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

      // Call API for response, passing history and previousSummary
      const divineResponse = await microserviceApi.askDivineQuestion(
          content,
          userTone,
          history,
          previousSummary // Pass the previous summary
      );
      const llmResponse = divineResponse.llm_response;

      // Check if response indicates an error occurred (using fallback structure)
      // Check based on the fallback response text or if llmResponse is missing
      if (!llmResponse || llmResponse.response.includes("Our connection seems weak")) {
          console.warn("Received fallback/error response from API.");
          // Error is already toasted by microserviceApi
          // Optionally, you could create a specific error message for the chat UI here
          // For now, just return to avoid adding the fallback to the chat
          return;
      }

      // Create assistant message with response
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(), // Simple unique ID
        role: 'assistant',
        content: llmResponse.response,
        timestamp: new Date(),
        scriptureReference: llmResponse.shloka ? {
          text: llmResponse.shloka,
          source: llmResponse.meaning
        } : undefined,
        isReframing: isMetaRequest // Add this property
      };

      // Callback to add response, emotion, and the new summary to state/DB
      onResponseReceived(
          responseMessage,
          llmResponse.emotion,
          llmResponse.new_summary // Pass the new summary back
      );

    } catch (error) {
      // Error should be handled/toasted within microserviceApi, but log just in case
      console.error('Error processing message in useChat:', error);
      // Avoid double-toasting if microserviceApi already did
      // Optionally add a generic error message to the chat UI here if desired
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processUserMessage
  };
};