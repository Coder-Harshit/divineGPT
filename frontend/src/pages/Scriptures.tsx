
import { useState } from 'react';
import { Search, Book, BookOpen } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

interface ScriptureCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ScriptureItem {
  id: string;
  title: string;
  category: string;
  description: string;
  verses?: number;
  chapters?: number;
}

const Scriptures = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: ScriptureCategory[] = [
    { 
      id: 'gita', 
      name: 'Bhagavad Gita', 
      description: 'The divine song of spiritual wisdom',
      icon: <Book className="h-6 w-6" />
    },
    { 
      id: 'ramayana', 
      name: 'Ramayana', 
      description: 'The journey of Lord Rama',
      icon: <BookOpen className="h-6 w-6" />
    },
    // { 
    //   id: 'upanishads', 
    //   name: 'Upanishads', 
    //   description: 'Philosophical texts that define the core of Hinduism',
    //   icon: <Book className="h-6 w-6" />
    // },
    // { 
    //   id: 'vedas', 
    //   name: 'Vedas', 
    //   description: 'The oldest scriptures of Hinduism',
    //   icon: <BookOpen className="h-6 w-6" />
    // },
  ];

  const scriptures: ScriptureItem[] = [
    {
      id: 'gita-1',
      title: 'Bhagavad Gita',
      category: 'gita',
      description: 'A 700-verse Hindu scripture that is part of the Indian epic Mahabharata, containing a conversation between Pandava prince Arjuna and his guide Lord Krishna.',
      verses: 700,
      chapters: 18
    },
    {
      id: 'ramayana-1',
      title: 'Valmiki Ramayana',
      category: 'ramayana',
      description: 'One of the two major Sanskrit epics of ancient India, telling the story of Rama, whose wife Sita is abducted by the demon king of Lanka, Ravana.',
      verses: 24000,
      chapters: 500
    },
    // {
    //   id: 'upanishad-1',
    //   title: 'Brihadaranyaka Upanishad',
    //   category: 'upanishads',
    //   description: 'One of the oldest Upanishads, a key scripture of Hinduism. It is associated with the Shukla Yajurveda and includes three sections: Madhu Kanda, Muni Kanda, and Khila Kanda.',
    //   chapters: 6
    // },
    // {
    //   id: 'upanishad-2',
    //   title: 'Chandogya Upanishad',
    //   category: 'upanishads',
    //   description: 'A Sanskrit text embedded in the Chandogya Brahmana of the Sama Veda. It is one of the oldest Upanishads, discussing meditation, ethics, and the nature of reality.',
    //   chapters: 8
    // },
    // {
    //   id: 'veda-1',
    //   title: 'Rig Veda',
    //   category: 'vedas',
    //   description: 'An ancient Indian collection of Vedic Sanskrit hymns, one of the four sacred canonical texts of Hinduism known as the Vedas.',
    //   verses: 10600
    // },
    // {
    //   id: 'veda-2',
    //   title: 'Sama Veda',
    //   category: 'vedas',
    //   description: 'The Veda of melodies and chants, an ancient Vedic Sanskrit text that is one of the four Vedas, the core text of Hinduism.',
    //   verses: 1875
    // },
  ];

  const filteredScriptures = scriptures.filter(scripture => {
    const matchesSearch = scripture.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         scripture.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? scripture.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-sanskrit font-bold mb-6">
              Sacred <span className="divine-text">Scriptures</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore the ancient wisdom of Hindu sacred texts that have guided spiritual seekers for thousands of years.
            </p>
            
            <div className="mt-10 max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scriptures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-card focus:outline-none focus:ring-2 focus:ring-divine-500"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-xl font-sanskrit font-medium mb-6">Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`glass-card p-4 rounded-xl border transition-all duration-300 hover:shadown-lg hover:border-divine-300 dark:hover:border-divine-500 dark:hover:bg-divine-900/20 ${
                    selectedCategory === category.id
                      ? 'border-divine-400 dark:border-divine-600 bg-divine-50/30 dark:bg-divine-900/30'
                      : 'border-divine-100 dark:border-divine-800 hover:border-divine-300 dark:hover:border-divine-700'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center text-divine-600 dark:text-divine-400">
                      {category.icon}
                    </div>
                    <div className="ml-3 text-left">
                      <h3 className="font-sanskrit font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Scripture List */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-sanskrit font-medium">Scriptures</h2>
              {selectedCategory && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Clear Filter
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredScriptures.length > 0 ? (
                filteredScriptures.map((scripture) => (
                  <div
                    key={scripture.id}
                    className="glass-card p-6 rounded-xl border border-divine-100 dark:border-divine-800 hover:border-divine-300 dark:hover:border-divine-700 transition-all duration-300 hover:shadown-lg dark:hover:bg-divine-900/20"
                  >
                    <h3 className="text-xl font-sanskrit font-semibold mb-2">{scripture.title}</h3>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <span className="px-2 py-1 rounded-full bg-divine-100 dark:bg-divine-900 text-divine-700 dark:text-divine-300 text-xs">
                        {categories.find(c => c.id === scripture.category)?.name}
                      </span>
                      {scripture.verses && (
                        <span className="ml-3">{scripture.verses.toLocaleString()} verses</span>
                      )}
                      {scripture.chapters && (
                        <span className="ml-3">{scripture.chapters} chapters</span>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {scripture.description}
                    </p>
                    
                    <Button variant="ghost" className="text-divine-600 dark:text-divine-400">
                      Explore Scripture
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-xl font-medium">No scriptures found</h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Scriptures;
