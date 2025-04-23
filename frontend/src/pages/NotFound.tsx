import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center glass-card p-8 rounded-xl divine-glow">
        <Logo className="mx-auto mb-6" size="lg" />
        
        <h1 className="text-4xl font-sanskrit font-bold mb-3">404</h1>
        <p className="text-xl mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          The spiritual path you seek cannot be found. Let us guide you back to the main journey.
        </p>
        
        <Link to="/">
          <Button variant="divine" className="w-full">
            <Home className="mr-2 h-5 w-5" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;