// Configuration for all microservices endpoints
export const MICROSERVICES = {
    // Main gateway service - single entry point for all requests
    GATEWAY: {
      BASE_URL: 'http://localhost:8002',
      ENDPOINTS: {
        ASK: '/ask',
        CHAT_HISTORY: '/chat/history',
      }
    },
    // Direct microservice endpoints (only use if gateway is down)
    DIRECT: {
      LLM_SERVICE: {
        BASE_URL: 'http://localhost:8000',
        ENDPOINTS: {
          ASK: '/ask',
        }
      },
      RAG_SERVICE: {
        BASE_URL: 'http://localhost:8001',
        ENDPOINTS: {
          SEARCH: '/search',
          SCRIPTURES: '/scriptures',
        }
      },
      T2S_SERVICE: {
        BASE_URL: 'http://localhost:8003',
        ENDPOINTS: {
          SPEAK: '/speak',
        }
      }
    }
  };
  