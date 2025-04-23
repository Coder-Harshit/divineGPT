import { useEffect, useRef } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const logoRef = useRef<SVGSVGElement>(null);
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  useEffect(() => {
    if (logoRef.current) {
      // Add any animation or effects initialization here if needed
    }
  }, []);

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        ref={logoRef}
        className={`${sizeClasses[size]} text-divine-600 dark:text-divine-500 transition-all duration-500`} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100"
        aria-label="DivineGPT Logo"
      >
        <path 
          fill="currentColor" 
          d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50s50-22.4,50-50S77.6,0,50,0z M76.7,56.7c-0.9,3.5-2.5,6.7-4.7,9.4
          c-2.2,2.7-4.9,4.9-8.1,6.4c-3.2,1.5-6.8,2.3-10.8,2.3c-4.2,0-7.9-0.8-11.2-2.3c-3.3-1.6-6.1-3.7-8.3-6.4c-2.3-2.7-4-5.9-5.2-9.4
          c-1.2-3.6-1.8-7.5-1.8-11.5c0-4.1,0.6-8,1.8-11.6c1.2-3.6,2.9-6.8,5.2-9.5c2.3-2.7,5.1-4.9,8.4-6.4c3.3-1.6,7.1-2.4,11.2-2.4
          c3.9,0,7.4,0.8,10.6,2.4c3.2,1.6,5.9,3.7,8.1,6.4c2.2,2.7,3.9,5.9,5,9.5c1.1,3.6,1.7,7.5,1.7,11.6C78.5,49.3,77.6,53.2,76.7,56.7z"
        />
        <path 
          fill="currentColor" 
          d="M50.8,25.8c-2.1,0-3.9,0.3-5.4,0.9c-1.5,0.6-2.7,1.4-3.7,2.4c-0.9,1-1.6,2.2-2,3.6c-0.4,1.4-0.6,2.8-0.6,4.4
          c0,1.6,0.2,3,0.6,4.4c0.4,1.4,1,2.6,1.9,3.6c0.9,1,2.1,1.8,3.6,2.4c1.5,0.6,3.3,0.9,5.5,0.9c2.2,0,4-0.3,5.5-0.9
          c1.5-0.6,2.7-1.4,3.6-2.4c0.9-1,1.6-2.2,1.9-3.6c0.4-1.4,0.6-2.8,0.6-4.4c0-1.5-0.2-3-0.6-4.4c-0.4-1.4-1-2.6-1.9-3.6
          c-0.9-1-2.1-1.8-3.6-2.4C54.8,26.1,53,25.8,50.8,25.8z"
        />
      </svg>
      <span className="ml-2 text-2xl font-sanskrit font-semibold text-foreground">
        Divine<span className="text-divine-600 dark:text-divine-500">GPT</span>
      </span>
    </div>
  );
};

export default Logo;