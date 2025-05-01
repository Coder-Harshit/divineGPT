import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, LoaderCircle, ChevronsRight, ChevronsLeft } from 'lucide-react';
import Button from './Button';
import { microserviceApi } from '@/services/microserviceApi';
import { toast } from '@/hooks/use-toast';
import { removeEmojis } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AudioControllerProps {
  text: string;
  className?: string;
}

const playbackSpeeds = [0.75, 1, 1.25, 1.5, 2];

const AudioController = ({ text, className = '' }: AudioControllerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
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

    if (!isLoading && !audioRef.current) {
      setIsLoading(true);
      try {
        const cleanedText = removeEmojis(text);
        if (!cleanedText) {
          throw new Error("No text content to speak after removing emojis.");
        }
        const audioBlob = await microserviceApi.textToSpeech(cleanedText, 'en');
        const audioUrl = URL.createObjectURL(audioBlob);

        const newAudio = new Audio(audioUrl);
        newAudio.muted = isMuted;
        newAudio.playbackRate = playbackRate;

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

      } catch (fetchError: any) {
        console.error('Error fetching or preparing audio:', fetchError);
        toast({
          title: "Audio Error",
          description: fetchError.message || "Could not load audio.",
          variant: "destructive",
        });
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

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground/70 hover:text-foreground w-10 text-xs"
            disabled={!audioRef.current && !isLoading}
          >
            {playbackRate}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[4rem]">
          {playbackSpeeds.map((speed) => (
            <DropdownMenuItem
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`text-xs ${playbackRate === speed ? 'bg-accent' : ''}`}
            >
              {speed}x
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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