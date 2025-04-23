import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from 'lucide-react';

type ToneType = 'mature' | 'neutral' | 'genz';

interface ToneSetterProps {
  currentTone: ToneType;
  onToneChange: (tone: ToneType) => void;
}

const ToneSetter = ({ currentTone, onToneChange }: ToneSetterProps) => {
  return (
    <div className="flex items-center space-x-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <Select value={currentTone} onValueChange={(value: ToneType) => onToneChange(value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select tone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mature">Mature</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
          <SelectItem value="genz">GenZ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ToneSetter;