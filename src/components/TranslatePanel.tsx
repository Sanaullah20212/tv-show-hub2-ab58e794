import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Volume2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TranslatePanelProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  isSource?: boolean;
  maxLength?: number;
}

export const TranslatePanel = ({
  value,
  onChange,
  placeholder,
  isSource = false,
  maxLength = 5000,
}: TranslatePanelProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handleClear = () => {
    if (onChange) {
      onChange("");
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(value);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex-1 relative rounded-xl border transition-all ${
          isFocused
            ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
            : "border-border"
        }`}
      >
        <Textarea
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          className="min-h-[300px] border-0 resize-none focus-visible:ring-0 text-lg p-6 bg-card"
          maxLength={maxLength}
          readOnly={!isSource}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            {isSource && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              className="h-8 w-8 hover:bg-muted"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {isSource && (
        <div className="mt-2 text-sm text-muted-foreground text-right">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};
