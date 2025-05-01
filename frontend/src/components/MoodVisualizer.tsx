import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface MoodEntry {
  timestamp: Date;
  emotion: string;
}

interface MoodVisualizerProps {
  moodHistory: MoodEntry[];
}

// Standardized emotions and their scores
const emotionScores: { [key: string]: number } = {
  'joy': 1,
  'happy': 0.8,
  'calm': 0.6,
  'neutral': 0.5, // Added neutral explicitly
  'anxious': 0.4, // Adjusted score slightly for better spacing
  'sad': 0.2,
  'angry': 0,
};

// Helper to get score, defaulting to neutral if unknown
const emotionToScore = (emotion: string): number => {
  return emotionScores[emotion?.toLowerCase()] ?? emotionScores['neutral'];
};

// Helper to get emotion label from score
const scoreToEmotion = (score: number): string => {
  // Find the closest matching emotion based on score
  let closestEmotion = 'Neutral';
  let minDiff = Math.abs(score - emotionScores['neutral']);

  for (const [emotion, s] of Object.entries(emotionScores)) {
    const diff = Math.abs(score - s);
    if (diff < minDiff) {
      minDiff = diff;
      closestEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1); // Capitalize
    }
  }
  return closestEmotion;
};

const MoodVisualizer = ({ moodHistory }: MoodVisualizerProps) => {
  // Ensure moodHistory is an array
  const validMoodHistory = Array.isArray(moodHistory) ? moodHistory : [];

  const data = validMoodHistory.map(entry => ({
    // Format timestamp for better readability
    timestamp: entry.timestamp instanceof Date 
      ? entry.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) 
      : 'Invalid Date',
    score: emotionToScore(entry.emotion),
    emotion: entry.emotion?.charAt(0).toUpperCase() + entry.emotion?.slice(1) || 'Neutral', // Capitalize
  }));

  const config = {
    score: {
      label: "Emotion Score",
      color: "hsl(var(--chart-1))", // Use theme color
    },
  };

  // Define ticks based on our standardized scores
  const yAxisTicks = Object.values(emotionScores).sort((a, b) => a - b);

  return (
    <Card className="w-full glass-card border-border/40">
      <CardHeader>
        <CardTitle className="text-lg font-sanskrit text-foreground/90">Your Emotional Journey</CardTitle>
        {/* Optional: Add description */}
        {/* <CardDescription>Tracking your emotional state over time.</CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={data} 
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mood-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/.3)" />
                  <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10} // Smaller font size
                    stroke="hsl(var(--muted-foreground))"
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={10} // Smaller font size
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 1]} // Explicit domain 0 to 1
                    ticks={yAxisTicks} // Use our defined ticks
                    tickFormatter={(value) => scoreToEmotion(value)} // Format ticks using scoreToEmotion
                    width={60} // Adjust width for labels
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    fill="url(#mood-gradient)"
                    strokeWidth={2} // Slightly thinner line
                    dot={false} // Hide dots for cleaner look
                  />
                  <ChartTooltip
                    cursor={false} // Disable cursor line for cleaner look
                    content={
                      <ChartTooltipContent 
                        className="w-[150px]"
                        nameKey="score" 
                        labelFormatter={(label, payload) => {
                          // Show emotion name in tooltip header if payload exists
                          return payload?.[0]?.payload?.emotion || label;
                        }}
                        formatter={(value, name, props) => (
                          // Show timestamp in tooltip body
                          <span>Time: {props.payload.timestamp}</span>
                        )}
                      />
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No mood data available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodVisualizer;