import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';
import { MICROSERVICES } from '@/config/microservices';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ServiceStatus = 'online' | 'offline' | 'checking';

interface ServiceHealthState {
  gateway: ServiceStatus;
  llm: ServiceStatus;
  rag: ServiceStatus;
  t2s: ServiceStatus;
}

const MicroserviceHealth = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceHealthState>({
    gateway: 'checking',
    llm: 'checking',
    rag: 'checking',
    t2s: 'checking'
  });

  // Check the health of a single service
  const checkServiceHealth = async (
    name: keyof ServiceHealthState, 
    url: string
  ): Promise<ServiceStatus> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok ? 'online' : 'offline';
    } catch (error) {
      return 'offline';
    }
  };

  // Check all services
  const checkAllServices = async () => {
    setServiceStatus({
      gateway: 'checking',
      llm: 'checking',
      rag: 'checking',
      t2s: 'checking'
    });

    const gatewayStatus = await checkServiceHealth(
      'gateway', 
      MICROSERVICES.GATEWAY.BASE_URL
    );
    
    const llmStatus = await checkServiceHealth(
      'llm', 
      MICROSERVICES.DIRECT.LLM_SERVICE.BASE_URL
    );
    
    const ragStatus = await checkServiceHealth(
      'rag', 
      MICROSERVICES.DIRECT.RAG_SERVICE.BASE_URL
    );
    
    const t2sStatus = await checkServiceHealth(
      't2s', 
      MICROSERVICES.DIRECT.T2S_SERVICE.BASE_URL
    );

    setServiceStatus({
      gateway: gatewayStatus,
      llm: llmStatus,
      rag: ragStatus,
      t2s: t2sStatus
    });
  };

  // Check service health on component mount
  useEffect(() => {
    checkAllServices();
    // Periodically check health every 60 seconds
    const interval = setInterval(checkAllServices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get status icon based on service status
  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
      default:
        return <LoaderCircle className="h-4 w-4 text-amber-500 animate-spin" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>API</span>
              {getStatusIcon(serviceStatus.gateway)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2 p-1">
              <div className="text-xs font-medium">Microservice Status</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>Gateway:</span>
                  {getStatusIcon(serviceStatus.gateway)}
                </div>
                <div className="flex items-center gap-1">
                  <span>LLM:</span>
                  {getStatusIcon(serviceStatus.llm)}
                </div>
                <div className="flex items-center gap-1">
                  <span>RAG:</span>
                  {getStatusIcon(serviceStatus.rag)}
                </div>
                <div className="flex items-center gap-1">
                  <span>T2S:</span>
                  {getStatusIcon(serviceStatus.t2s)}
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  checkAllServices();
                }}
                className="text-xs text-divine-500 hover:text-divine-600 dark:text-divine-400 dark:hover:text-divine-300"
              >
                Refresh Status
              </button>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default MicroserviceHealth;