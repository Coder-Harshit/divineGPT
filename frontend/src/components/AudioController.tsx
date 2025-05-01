import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, LoaderCircle } from 'lucide-react';
import Button from './Button';
import { microserviceApi } from '@/services/microserviceApi';
import { toast } from '@/hooks/use-toast';

interface AudioControllerProps {
  text: string;
  className?: string;
}

const AudioController = ({ text, className = '' }: AudioControllerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayPause = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing existing audio:", error);
          toast({ title: "Playback Error", description: "Could not play audio.", variant: "destructive" });
          setIsPlaying(false);
        }
      }
      return;
    }

    if (!isLoading) {
      setIsLoading(true);
      try {
        const audioBlob = await microserviceApi.textToSpeech(text, 'en');
        const audioUrl = URL.createObjectURL(audioBlob);

        const newAudio = new Audio(audioUrl);
        newAudio.muted = isMuted;

        newAudio.oncanplaythrough = async () => {
          try {
            await newAudio.play();
            setIsPlaying(true);
            setIsLoading(false);
          } catch (playError) {
            console.error("Error starting playback:", playError);
            toast({ title: "Playback Error", description: "Could not start audio playback.", variant: "destructive" });
            setIsPlaying(false);
            setIsLoading(false);
          }
        };

        newAudio.onended = () => {
          setIsPlaying(false);
        };
        newAudio.onerror = (e) => {
          console.error('Audio playback error:', e);
          toast({ title: "Audio Error", description: "Failed to load or play audio.", variant: "destructive" });
          setIsPlaying(false);
          setIsLoading(false);
          if (audioRef.current && audioRef.current.src.startsWith('blob:')) {
            URL.revokeObjectURL(audioRef.current.src);
          }
          audioRef.current = null;
        };

        audioRef.current = newAudio;

      } catch (fetchError) {
        console.error('Error fetching audio:', fetchError);
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={isLoading}
        className="text-foreground/70 hover:text-foreground"
      >
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        className="text-foreground/70 hover:text-foreground"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
      </Button>
    </div>
  );
};

export default AudioController;