import i18n  from './i18n';
import axios from 'axios';
import { language_key } from '../config/constants';
const BASE_URL = 'https://translation.googleapis.com/language/translate/v2';
export const translateTextLanguage = async (text) => {
  try {
    if (i18n.language === 'en') {
      return text;
    }

    if(text) {
      const response = await axios.post(BASE_URL, null, {
        params: {
          q: text,
          source: 'en',
          target: i18n.language,
          key: language_key,
        },
      });

      const translatedText = response.data.data.translations[0].translatedText;
      return translatedText;
    }
   

   return text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text; // fallback to original text
  }
};