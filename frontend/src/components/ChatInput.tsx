
import { useState, FormEvent, ChangeEvent } from 'react';
import { Send } from 'lucide-react';
import Button from './Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Auto-resize textarea based on content
  const handleTextareaInput = (e: FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="glass-card p-3 sticky bottom-0 left-0 right-0 z-10"
    >
      <div className="relative flex items-end">
        <textarea
          value={message}
          onChange={handleChange}
          onInput={handleTextareaInput}
          placeholder="Ask for wisdom and guidance..."
          className="w-full p-3 pr-14 rounded-lg bg-background/60 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-divine-400 dark:focus:ring-divine-600 min-h-[56px] max-h-[200px]"
          rows={1}
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="absolute bottom-3 right-3 text-white p-2 rounded-lg h-auto"
          disabled={!message.trim() || isLoading}
          variant="divine"
          size="sm"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
