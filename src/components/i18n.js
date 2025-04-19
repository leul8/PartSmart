
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationAmharic from '/home/leul/Desktop/s/src/locales/am/translation.json'; 
import translationEnglish from '/home/leul/Desktop/s/src/locales/en/translation.json';  

i18n
  .use(initReactI18next)  
  .init({
    resources: {
      en: {
        translation: translationEnglish,
      },
      am: {
        translation: translationAmharic,
      },
    },
    lng: 'en', 
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
