import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

interface MoodEntry {
  timestamp: Date;
  emotion: string;
}

interface MoodVisualizerProps {
  moodHistory: MoodEntry[];
}

const MoodVisualizer = ({ moodHistory }: MoodVisualizerProps) => {
  const emotionToScore = (emotion: string): number => {
    const scores: { [key: string]: number } = {
      'joy': 1,
      'happy': 0.8,
      'calm': 0.6,
      'neutral': 0.5,
      'anxious': 0.3,
      'sad': 0.2,
      'angry': 0,
    };
    return scores[emotion.toLowerCase()] ?? 0.5;
  };

  const data = moodHistory.map(entry => ({
    timestamp: entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: emotionToScore(entry.emotion),
    emotion: entry.emotion,
  }));

  const config = {
    primary: {
      color: '#8B5CF6',
      gradient: 'url(#mood-gradient)',
    },
  };

  return (
    <Card className="w-full glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-sanskrit">Your Emotional Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mood-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="timestamp" 
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#8B5CF6"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#8B5CF6"
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                  tickFormatter={(value) => {
                    const emotions = {
                      0: 'Angry',
                      0.2: 'Sad',
                      0.4: 'Anxious',
                      0.6: 'Calm',
                      0.8: 'Happy',
                      1: 'Joy'
                    };
                    return emotions[value as keyof typeof emotions] || '';
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8B5CF6"
                  fill="url(#mood-gradient)"
                  strokeWidth={3}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{data.timestamp}</div>
                          <div className="font-sanskrit text-divine-600">{data.emotion}</div>
                        </div>
                      </div>
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodVisualizer;