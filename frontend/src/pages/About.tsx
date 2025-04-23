
import { motion } from 'framer-motion';
import { BookOpen, Heart, MessageCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-sanskrit font-bold mb-6 text-center">
                About <span className="divine-text">DivineGPT</span>
              </h1>
              <div className="glass-card p-6 md:p-8 rounded-xl border border-divine-100 dark:border-divine-800 mb-10">
                <h2 className="text-2xl font-sanskrit font-semibold mb-4">Our Mission</h2>
                <p className="text-lg mb-6">
                  DivineGPT was created with a singular purpose: to make the timeless wisdom of Hindu scriptures accessible and applicable to modern life challenges. We believe that the emotional and spiritual guidance found in these ancient texts can provide solace, direction, and clarity in our complex world.
                </p>
                <p className="text-lg">
                  By combining artificial intelligence with deep textual understanding of the Bhagavad Gita, Ramayana, Upanishads, and other sacred Hindu texts, we've created a platform that delivers personalized spiritual guidance in a conversational format.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-2xl font-sanskrit font-semibold mb-6">What Makes Us Different</h2>
              <div className="space-y-6 mb-10">
                <div className="glass-card p-6 rounded-xl border border-divine-100 dark:border-divine-800">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center text-divine-600 dark:text-divine-400">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-sanskrit font-medium mb-2">Deep Scriptural Knowledge</h3>
                      <p className="text-muted-foreground">
                        Our AI has been trained on the complete texts of major Hindu scriptures, allowing it to draw precise and relevant guidance for your specific situation.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-xl border border-divine-100 dark:border-divine-800">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center text-divine-600 dark:text-divine-400">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-sanskrit font-medium mb-2">Emotional Intelligence</h3>
                      <p className="text-muted-foreground">
                        Beyond just providing information, DivineGPT is designed to understand emotional context and offer compassionate support during challenges.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-xl border border-divine-100 dark:border-divine-800">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-divine-100 dark:bg-divine-900 flex items-center justify-center text-divine-600 dark:text-divine-400">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-sanskrit font-medium mb-2">Conversational Wisdom</h3>
                      <p className="text-muted-foreground">
                        Our intuitive chat interface makes it easy to engage with ancient wisdom in a natural, flowing conversation, just like speaking with a spiritual guide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h2 className="text-2xl font-sanskrit font-semibold mb-6">Our Approach</h2>
              <div className="glass-card p-6 md:p-8 rounded-xl border border-divine-100 dark:border-divine-800 mb-10">
                <p className="mb-4">
                  DivineGPT approaches spiritual guidance with respect for the profound depth of Hindu scriptures. We recognize that these texts contain layers of meaning—from straightforward moral guidance to complex philosophical insights.
                </p>
                <p className="mb-4">
                  Our AI is designed to meet you where you are on your spiritual journey. Whether you're seeking practical advice for daily challenges, emotional support during difficult times, or deeper philosophical understanding, DivineGPT adapts to your needs.
                </p>
                <p>
                  While our AI draws from traditional texts, we present this wisdom in a way that's accessible to people of all backgrounds, regardless of their familiarity with Hindu philosophy.
                </p>
              </div>
              
              <div className="text-center py-8 mb-10">
                <blockquote className="italic text-xl font-sanskrit">
                  "Whenever dharma declines and the purpose of life is forgotten, I manifest myself on earth. I am born in every age to protect the good, to destroy evil, and to reestablish dharma."
                </blockquote>
                <p className="mt-4 text-muted-foreground">
                  — Lord Krishna, Bhagavad Gita, Chapter 4, Verse 7-8
                </p>
              </div>
              
              <h2 className="text-2xl font-sanskrit font-semibold mb-6">Join Us on This Journey</h2>
              <div className="glass-card p-6 md:p-8 rounded-xl border border-divine-100 dark:border-divine-800">
                <p className="mb-4">
                  DivineGPT is more than just an AI chatbot—it's a companion on your spiritual journey. We're constantly improving and expanding our understanding of these sacred texts to better serve your needs.
                </p>
                <p>
                  We invite you to engage with the timeless wisdom of Hindu scriptures through our platform, and discover how these ancient teachings can bring clarity, peace, and purpose to your modern life.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
