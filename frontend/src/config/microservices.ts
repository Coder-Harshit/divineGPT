/// <reference types="vite/client" />

const GATEWAY_URL = import.meta.env.VITE_APP_GATEWAY_URL || 'http://localhost:8002';
const LLM_SERVICE_URL = import.meta.env.VITE_APP_LLM_SERVICE_URL || 'http://localhost:8000';
const RAG_SERVICE_URL = import.meta.env.VITE_APP_RAG_SERVICE_URL || 'http://localhost:8001';
const T2S_SERVICE_URL = import.meta.env.VITE_APP_T2S_SERVICE_URL || 'http://localhost:8003';

// Configuration for all microservices endpoints
export const MICROSERVICES = {
    // Main gateway service - single entry point for all requests
    GATEWAY: {
      BASE_URL: GATEWAY_URL,
      ENDPOINTS: {
        ASK: '/ask',
        CHAT_HISTORY: '/chat/history',
      }
    },
    // Direct microservice endpoints (only use if gateway is down)
    DIRECT: {
      LLM_SERVICE: {
        BASE_URL: LLM_SERVICE_URL,
        ENDPOINTS: {
          ASK: '/ask',
        }
      },
      RAG_SERVICE: {
        BASE_URL: RAG_SERVICE_URL,
        ENDPOINTS: {
          SEARCH: '/search',
          SCRIPTURES: '/scriptures',
        }
      },
      T2S_SERVICE: {
        BASE_URL: T2S_SERVICE_URL,
        ENDPOINTS: {
          SPEAK: '/speak',
        }
      }
    }
  };
  