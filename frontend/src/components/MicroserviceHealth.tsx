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

  const [serviceDetails, setServiceDetails] = useState<any>({});

  // Check the health of a single service
  const checkServiceHealth = async (
    name: keyof ServiceHealthState, 
    url: string
  ): Promise<ServiceStatus> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      console.log(`Checking ${name} service at ${url}/health`);
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

  const fetchServiceDetails = async () => {
    const details: any = {};
    for (const [key, config] of Object.entries({...MICROSERVICES.DIRECT, "GATEWAY": MICROSERVICES.GATEWAY})) {
      const serviceName = key == "GATEWAY" ? "gateway" : key.toLowerCase().replace("_service", "");
      try {
        const res = await fetch(`${config.BASE_URL}/health`);
        details[serviceName] = await res.json();
      } catch {
        details[serviceName] = { status: "offline" };
      }
    }
    // // Gateway
    // try {
    //   const res = await fetch(`${MICROSERVICES.GATEWAY.BASE_URL}/status`);
    //   details.gateway = await res.json();
    // } catch {
    //   details.gateway = { status: "offline" };
    // }
    setServiceDetails(details);
  };

  // Check service health on component mount
  useEffect(() => {
    checkAllServices();
    fetchServiceDetails();
    // Periodically check health every 60 seconds
    const interval = setInterval(() => {
      checkAllServices();
      fetchServiceDetails();
    }, 60000);
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
                {["gateway", "llm", "rag", "t2s"].map((key) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="flex items-center gap-1">
                      {key.toUpperCase()}:
                      {getStatusIcon(serviceStatus[key as keyof ServiceHealthState])}
                    </span>
                    {/* <span>
                      {serviceDetails[key]?.service || ""}
                      {serviceDetails[key]?.port ? ` (:${serviceDetails[key].port})` : ""}
                      {serviceDetails[key]?.status && serviceDetails[key]?.status !== "running"
                        ? ` - ${serviceDetails[key].status}`
                        : ""}
                    </span> */}
                  </div>
                ))}
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  checkAllServices();
                  fetchServiceDetails();
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