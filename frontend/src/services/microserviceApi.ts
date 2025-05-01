import { MICROSERVICES } from '@/config/microservices';
import { toast } from '@/hooks/use-toast';
import { Message } from '@/types/chat';

// Types for microservice responses
// Define the structure expected by the backend (matches shared/schema.py AskRequest)
interface AskApiPayload {
  query: string;
  user_type: string;
  history?: { role: string; content: string }[]; // Match MessageSchema
  previous_summary?: string; // Add previous_summary
}

// Define the structure received from the backend (matches shared/schema.py RAGServiceResponse)
export interface DivineResponse {
  user_query: string;
  retrieved_shlokas: any[]; // Use specific type if available
  llm_response: {
    shloka: string;
    meaning: string;
    shloka_summary: string;
    response: string;
    reflection: string;
    emotion: string;
    new_summary: string; // Add new_summary here
  };
  context?: string;
  prompt?: string;
}

export type AudioResponse = {
  audio_data: string;
  format: string;
};


// Fallback response structure
const FALLBACK_DIVINE_RESPONSE: DivineResponse = {
  user_query: "", // Will be filled in
  retrieved_shlokas: [],
  llm_response: {
    shloka: "कार्पण्यदोषोपहतस्वभावः\nपृच्छामि त्वां धर्मसम्मूढचेताः",
    meaning: "My heart is overpowered by the taint of pity; my mind is confused as to duty.",
    shloka_summary: "This shloka speaks to the confusion and seeking of guidance.",
    response: "My apologies, friend. Our connection seems weak, like a flickering lamp in the wind. Please try asking again shortly.",
    reflection: "Patience is a virtue we cultivate even in technical difficulties.",
    emotion: "calm",
    new_summary: "" // Add default empty new_summary
  }
};
/**
 * API client for interacting with the microservices
 */
class MicroserviceApi {
  private useGateway: boolean = true;

  constructor(useGateway: boolean = true) {
    this.useGateway = useGateway;
  }

  /**
   * Get the base URL for API requests
   */
  private getBaseUrl(service: 'GATEWAY' | 'LLM_SERVICE' | 'RAG_SERVICE' | 'T2S_SERVICE'): string {
    if (this.useGateway || service === 'GATEWAY') {
      return MICROSERVICES.GATEWAY.BASE_URL;
    }

    return MICROSERVICES.DIRECT[service].BASE_URL;
  }

  /**
   * Get an endpoint URL
   */
  private getEndpoint(service: 'GATEWAY' | 'LLM_SERVICE' | 'RAG_SERVICE' | 'T2S_SERVICE', endpoint: string): string {
    if (this.useGateway || service === 'GATEWAY') {
      return `${MICROSERVICES.GATEWAY.BASE_URL}${MICROSERVICES.GATEWAY.ENDPOINTS[endpoint] || '/' + endpoint}`;
    }

    return `${MICROSERVICES.DIRECT[service].BASE_URL}${MICROSERVICES.DIRECT[service].ENDPOINTS[endpoint] || '/' + endpoint}`;
  }

  /**
   * Send a query to the LLM service
   */
  async askDivineQuestion(
    query: string,
    userType: string,
    history: Message[] = [],
    previousSummary: string = '',
  ): Promise<DivineResponse> {
    const service = this.useGateway ? 'GATEWAY' : 'LLM_SERVICE';
    const endpoint = this.useGateway ? 'ASK' : 'ASK';
    
    const formattedHistory = history?.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const payload: AskApiPayload = {
      query,
      user_type: userType,
      history: formattedHistory,
      previous_summary: previousSummary, // Include previousSummary in payload
    };

    try {
        console.log(`Sending query to ${this.getEndpoint(service, endpoint)} with payload:`, payload);
        const response = await fetch(this.getEndpoint(service, endpoint), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        console.log(`Received response status: ${response.status}`);
        if (!response.ok) {
          let errorDetail = `API call failed with status: ${response.status}`;
          try {
            const errorJson = await response.json();
            errorDetail = errorJson.detail || errorDetail;
          } catch (e) {}
          throw new Error(errorDetail);
        }
        const responseData: DivineResponse = await response.json();
        console.log("Received DivineResponse:", responseData);
  
        // Basic validation of the received structure
        if (!responseData?.llm_response?.new_summary === undefined) {
            console.warn("Received response missing 'llm_response.new_summary'. Using fallback structure.");
            // Return fallback but keep user query and potentially other parts if they exist
            return {
                ...FALLBACK_DIVINE_RESPONSE,
                user_query: query,
                llm_response: {
                    ...(responseData?.llm_response || FALLBACK_DIVINE_RESPONSE.llm_response), // Keep existing llm_response fields if possible
                    new_summary: previousSummary || "" // Use previous summary as fallback for new one
                }
            };
        }
  
        return responseData;
  
      } catch (error: any) {
        console.error('Error asking divine question:', error);
        toast({
          title: "Connection Error",
          description: error.message || "Failed to get response from the divine realms. Please try again.",
          variant: "destructive"
        });
        // Return fallback, ensuring new_summary uses previous summary
        return {
            ...FALLBACK_DIVINE_RESPONSE,
            user_query: query,
            llm_response: {
                ...FALLBACK_DIVINE_RESPONSE.llm_response,
                new_summary: previousSummary || "" // Use previous summary as fallback
            }
        };
      }
    }
  
        
      // const response = await fetch(this.getEndpoint(service, endpoint), {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     query,
      //     user_type: userType
      //   }),
      // });

  //     if (!response.ok) {
  //       throw new Error(`API call failed with status: ${response.status}`);
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error('Error fetching divine response:', error);
      
  //     // Return a fallback response if API call fails
  //     return {
  //       user_query: query,
  //       llm_response: {
  //         shloka: "कार्पण्यदोषोपहतस्वभावः\nपृच्छामि त्वां धर्मसम्मूढचेताः",
  //         meaning: "My heart is overpowered by the taint of pity; my mind is confused as to duty.",
  //         shloka_summary: "This shloka speaks to the confusion and seeking of guidance.",
  //         response: "Our services are currently in meditation. Please try again soon.",
  //         reflection: "How can I assist you in another way?",
  //         emotion: "calm",
  //         new_summary: ""
  //       },
  //       retrieved_shlokas: [],
  //     };
  //   }
  // }

  /**
   * Get text-to-speech audio from the T2S service
   */
  async textToSpeech(text: string, lang: string = 'en'): Promise<Blob> {
    try {
      const service = this.useGateway ? 'GATEWAY' : 'T2S_SERVICE';
      const endpoint = this.useGateway ? 'speak' : 'SPEAK';
      const response = await fetch(this.getEndpoint(service, endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          lang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Text-to-speech API call failed with status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error fetching audio:', error);
      toast({
        title: "Error",
        description: "Text-to-speech service is unavailable.",
        variant: "destructive"
      });
      throw error;
    }
  }

  /**
   * Search for scriptures using the RAG service
   */
  async searchScriptures(query: string, scripture: string = 'all'): Promise<any> {
    try {
      const service = this.useGateway ? 'GATEWAY' : 'RAG_SERVICE';
      const endpoint = this.useGateway ? 'search' : 'SEARCH';
      
      const response = await fetch(this.getEndpoint(service, endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          scripture,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scripture search API call failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching scriptures:', error);
      toast({
        title: "Error",
        description: "Scripture search service is unavailable.",
        variant: "destructive"
      });
      throw error;
    }
  }
}

// Export a singleton instance
export const microserviceApi = new MicroserviceApi(true); // Using gateway by default