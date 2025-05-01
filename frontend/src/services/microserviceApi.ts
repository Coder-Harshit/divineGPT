import { MICROSERVICES } from '@/config/microservices';
import { toast } from '@/hooks/use-toast';

// Types for microservice responses
export type DivineResponse = {
  user_query: string;
  llm_response: {
    shloka: string;
    meaning: string;
    shloka_summary: string;
    response: string;
    reflection: string;
    emotion: string;
  };
};

export type AudioResponse = {
  audio_data: string;
  format: string;
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
  async askDivineQuestion(query: string, userType: string): Promise<DivineResponse> {
    try {
      const service = this.useGateway ? 'GATEWAY' : 'LLM_SERVICE';
      const endpoint = this.useGateway ? 'ASK' : 'ASK';
      
      const response = await fetch(this.getEndpoint(service, endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          user_type: userType
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching divine response:', error);
      
      // Return a fallback response if API call fails
      return {
        user_query: query,
        llm_response: {
          shloka: "कार्पण्यदोषोपहतस्वभावः\nपृच्छामि त्वां धर्मसम्मूढचेताः",
          meaning: "My heart is overpowered by the taint of pity; my mind is confused as to duty.",
          shloka_summary: "This shloka speaks to the confusion and seeking of guidance.",
          response: "Our services are currently in meditation. Please try again soon.",
          reflection: "How can I assist you in another way?",
          emotion: "calm"
        }
      };
    }
  }

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
      console.log(response);

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