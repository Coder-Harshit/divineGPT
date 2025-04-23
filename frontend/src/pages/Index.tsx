
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Heart, MessageCircle, Quote } from 'lucide-react';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-divine-100/30 to-saffron-100/20 dark:from-divine-900/30 dark:to-saffron-900/20 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-6xl font-sanskrit font-bold mb-6 tracking-tight">
                Spiritual <span className="divine-text">Wisdom</span> & Guidance for Your Soul
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10">
                Experience emotional support and guidance inspired by the timeless teachings of Hindu scriptures, powered by AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/chat">
                  <Button variant="divine" size="lg" className="w-full sm:w-auto">
                    Start Conversation <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="mt-16 glass-card p-5 sm:p-8 rounded-2xl border border-divine-100 dark:border-divine-800 divine-glow"
            >
              <div className="relative">
                <div className="absolute -top-2 right-1/2 transform translate-x-1/2 -translate-y-12 bg-divine-600 dark:bg-divine-500 text-white p-3 rounded-full">
                  <Quote className="h-6 w-6" />
                </div>
                <p className="font-sanskrit text-lg md:text-xl mt-12 italic">
                  "For him who has conquered the mind, the mind is the best of friends;
                  but for one who has failed to do so, his very mind will be the greatest enemy."
                </p>
                <p className="mt-4 text-muted-foreground">
                  — Bhagavad Gita, Chapter 6, Verse 6
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-divine-50/50 dark:from-background dark:to-divine-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-sanskrit font-bold mb-4">Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining ancient wisdom with modern technology to guide your journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 rounded-xl border border-divine-100 dark:border-divine-800"
            >
              <div className="h-12 w-12 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center mb-5">
                <MessageCircle className="h-6 w-6 text-divine-600 dark:text-divine-400" />
              </div>
              <h3 className="text-xl font-sanskrit font-semibold mb-3">AI Chat Support</h3>
              <p className="text-muted-foreground">
                Ask questions and receive guidance based on Hindu scriptures with our intuitive chat interface.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-card p-6 rounded-xl border border-divine-100 dark:border-divine-800"
            >
              <div className="h-12 w-12 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center mb-5">
                <BookOpen className="h-6 w-6 text-divine-600 dark:text-divine-400" />
              </div>
              <h3 className="text-xl font-sanskrit font-semibold mb-3">Scripture Selection</h3>
              <p className="text-muted-foreground">
                Focus your conversation on specific scriptures like the Gita, Ramayana, or Upanishads.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="glass-card p-6 rounded-xl border border-divine-100 dark:border-divine-800"
            >
              <div className="h-12 w-12 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center mb-5">
                <Heart className="h-6 w-6 text-divine-600 dark:text-divine-400" />
              </div>
              <h3 className="text-xl font-sanskrit font-semibold mb-3">Emotional Support</h3>
              <p className="text-muted-foreground">
                Receive compassionate guidance for emotional and spiritual challenges in your daily life.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-sanskrit font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DivineGPT makes ancient wisdom accessible through modern technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center text-divine-600 dark:text-divine-400 font-bold">
                    1
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-sanskrit font-medium mb-2">Choose Your Guidance</h3>
                    <p className="text-muted-foreground">
                      Select specific scriptures or let DivineGPT draw from the entire Hindu textual tradition.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center text-divine-600 dark:text-divine-400 font-bold">
                    2
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-sanskrit font-medium mb-2">Ask Your Question</h3>
                    <p className="text-muted-foreground">
                      Share your struggles, challenges, or spiritual inquiries in a conversational format.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center text-divine-600 dark:text-divine-400 font-bold">
                    3
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-sanskrit font-medium mb-2">Receive Divine Wisdom</h3>
                    <p className="text-muted-foreground">
                      Get personalized guidance with relevant scripture references to help you on your path.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-1 rounded-xl border border-divine-100 dark:border-divine-800 shadow-xl overflow-hidden"
            >
              <div className="bg-white/90 dark:bg-divine-950/90 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-divine-100 dark:border-divine-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Logo size="sm" />
                    <span className="text-sm font-medium">DivineGPT Chat</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-divine-200 dark:bg-divine-700"></div>
                    <div className="h-3 w-3 rounded-full bg-saffron-300 dark:bg-saffron-600"></div>
                    <div className="h-3 w-3 rounded-full bg-red-300 dark:bg-red-700"></div>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="max-w-[75%] ml-auto bg-divine-600 text-white px-4 py-2 rounded-2xl">
                    <p className="text-sm">How can I find inner peace with so much stress in my life?</p>
                  </div>
                  
                  <div className="max-w-[75%] mr-auto glass-card px-4 py-2 rounded-2xl">
                    <p className="text-sm">
                      The Bhagavad Gita teaches us that peace comes when we perform our duties without attachment to results. Focus on your actions, not the fruits of those actions.
                    </p>
                    <div className="mt-2 pt-2 border-t border-divine-200/30 dark:border-divine-700/30 text-xs">
                      <blockquote className="italic text-sm">
                        "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."
                      </blockquote>
                      <p className="mt-1">— Bhagavad Gita, Chapter 2, Verse 47</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border-t border-divine-100 dark:border-divine-800 flex">
                  <input
                    type="text"
                    className="flex-1 rounded-full px-4 py-2 bg-background/60 border border-divine-200 dark:border-divine-800 text-sm focus:outline-none focus:ring-2 focus:ring-divine-500"
                    placeholder="Ask for wisdom and guidance..."
                    readOnly
                  />
                  <button className="ml-2 p-2 rounded-full bg-divine-600 text-white">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-divine-100 to-divine-200 dark:from-divine-900 dark:to-divine-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-sanskrit font-bold mb-6">
            Begin Your Spiritual Journey Today
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto">
            Connect with ancient wisdom adapted to your modern life challenges. 
            Let DivineGPT be your guide on the path to greater peace, purpose, and understanding.
          </p>
          <Link to="/chat">
            <Button variant="divine" size="lg" className="bg-white/90 dark:bg-black/30">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;