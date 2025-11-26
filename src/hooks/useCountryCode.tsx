import { useState, useEffect } from 'react';

interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'PK', dial: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'MY', dial: '+60', flag: '🇲🇾', name: 'Malaysia' },
];

export const useCountryCode = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try to detect country from IP using ipapi.co (free tier)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code) {
          const detectedCountry = COUNTRY_CODES.find(
            country => country.code === data.country_code
          );
          if (detectedCountry) {
            setSelectedCountry(detectedCountry);
          }
        }
      } catch (error) {
        console.log('Could not detect country, using default (Bangladesh)');
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountry();
  }, []);

  return {
    selectedCountry,
    setSelectedCountry,
    countryList: COUNTRY_CODES,
    isDetecting,
  };
};
