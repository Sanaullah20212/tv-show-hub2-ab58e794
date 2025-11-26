import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

interface CountryCodeSelectorProps {
  selectedCountry: CountryCode;
  countryList: CountryCode[];
  onCountryChange: (country: CountryCode) => void;
  disabled?: boolean;
}

export const CountryCodeSelector = ({
  selectedCountry,
  countryList,
  onCountryChange,
  disabled = false,
}: CountryCodeSelectorProps) => {
  return (
    <Select
      value={selectedCountry.code}
      onValueChange={(code) => {
        const country = countryList.find((c) => c.code === code);
        if (country) onCountryChange(country);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px] border-r-0 rounded-r-none bg-muted/50">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg">{selectedCountry.flag}</span>
          <SelectValue>
            <span className="font-medium">{selectedCountry.dial}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="z-[100]">
        {countryList.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{country.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{country.dial}</span>
                <span className="text-xs text-muted-foreground">{country.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
