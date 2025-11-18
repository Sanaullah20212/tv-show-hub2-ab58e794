import { useState } from "react";
import { TranslatePanel } from "@/components/TranslatePanel";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Languages } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    // Mock translation - in a real app, this would call a translation API
    const mockTranslations: Record<string, string> = {
      "Hello": "Hola",
      "Goodbye": "Adiós",
      "Thank you": "Gracias",
      "How are you?": "¿Cómo estás?",
    };

    const translation = mockTranslations[sourceText] || 
      `[Translated from ${sourceLanguage} to ${targetLanguage}]: ${sourceText}`;
    
    setTranslatedText(translation);
    toast.success("Translation complete");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Languages className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-3">
            Instant Translate
          </h1>
          <p className="text-muted-foreground text-lg">
            Translate text between languages instantly
          </p>
        </header>

        {/* Translation Interface */}
        <div className="max-w-6xl mx-auto">
          {/* Language Selectors */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <LanguageSelector
              value={sourceLanguage}
              onChange={setSourceLanguage}
              excludeLanguage={targetLanguage}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              className="h-10 w-10 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </Button>
            <LanguageSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
              excludeLanguage={sourceLanguage}
            />
          </div>

          {/* Translation Panels */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <TranslatePanel
              value={sourceText}
              onChange={setSourceText}
              placeholder="Enter text to translate..."
              isSource
            />
            <TranslatePanel
              value={translatedText}
              placeholder="Translation will appear here..."
            />
          </div>

          {/* Translate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleTranslate}
              size="lg"
              className="min-w-[200px] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={!sourceText.trim()}
            >
              Translate
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by modern translation technology</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
