import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  excludeLanguage?: string;
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

export const LanguageSelector = ({
  value,
  onChange,
  excludeLanguage,
}: LanguageSelectorProps) => {
  const filteredLanguages = languages.filter(
    (lang) => lang.code !== excludeLanguage
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] border-border bg-card hover:bg-muted transition-colors">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {filteredLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
