import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or use system preference
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Update DOM and localStorage
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

    return (
      <motion.button
        onClick={toggleTheme}
        className="p-2 rounded-full glass-card flex items-center justify-center transition-all hover:scale-110"
        aria-label="Toggle theme"
            >
        <motion.div
          animate={{
            rotate: darkMode ? 360 : 0,
            scale: darkMode ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-saffron-400" />
          ) : (
            <Moon className="h-5 w-5 text-divine-600" />
          )}
        </motion.div>
            </motion.button>
    );
  };


export default ThemeToggle;