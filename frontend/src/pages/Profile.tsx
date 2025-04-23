import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import MoodVisualizer from '@/components/MoodVisualizer';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile();
    getMoodHistory();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setUsername(data.username);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error loading profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('emotional_journey')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      if (data) {
        const formattedData = data.map(entry => ({
          timestamp: new Date(entry.timestamp),
          emotion: entry.emotion
        }));
        setMoodHistory(formattedData);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="pt-24 pb-6 max-w-4xl mx-auto px-4">
        <div className="glass-card p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-sanskrit mb-6">Your Profile</h2>
          
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              <Button onClick={updateProfile}>
                Update Profile
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-sanskrit mb-6">Your Emotional Journey</h2>
          {moodHistory.length > 0 ? (
            <MoodVisualizer moodHistory={moodHistory} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Start chatting to begin tracking your emotional journey
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
