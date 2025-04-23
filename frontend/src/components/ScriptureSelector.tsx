
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface ScriptureSelectorProps {
  onSelect: (scripture: string) => void;
  selected: string;
}

const ScriptureSelector = ({ onSelect, selected }: ScriptureSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const scriptures = [
    { id: 'all', name: 'All Scriptures' },
    { id: 'bhagavad-gita', name: 'Bhagavad Gita' },
    { id: 'ramayana', name: 'Ramayana' },
    { id: 'mahabharata', name: 'Mahabharata' },
    { id: 'upanishads', name: 'Upanishads' },
    { id: 'vedas', name: 'Vedas' },
  ];

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  const selectedScripture = scriptures.find(s => s.id === selected) || scriptures[0];

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-between items-center rounded-md glass-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-divine-50/20 dark:hover:bg-divine-900/20 focus:outline-none focus:ring-2 focus:ring-divine-500"
          id="scripture-selector"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedScripture.name}
          <ChevronDown className="-mr-1 ml-2 h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md glass-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="scripture-selector"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {scriptures.map((scripture) => (
              <button
                key={scripture.id}
                className={`flex w-full items-center px-4 py-2 text-sm ${
                  selected === scripture.id
                    ? 'text-divine-600 dark:text-divine-400 bg-divine-50/20 dark:bg-divine-900/20'
                    : 'text-foreground hover:bg-divine-50/10 dark:hover:bg-divine-900/10'
                }`}
                role="menuitem"
                tabIndex={-1}
                onClick={() => handleSelect(scripture.id)}
              >
                <span className="flex-grow text-left">{scripture.name}</span>
                {selected === scripture.id && <Check className="h-4 w-4 ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptureSelector;