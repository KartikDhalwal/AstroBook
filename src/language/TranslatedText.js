import { useEffect, useState } from "react";
import axios from "axios";
import i18n from "./i18n";
import { language_key } from "../../config/constants";

const BASE_URL = "https://translation.googleapis.com/language/translate/v2";

const TranslateText = ({ title }) => {
  const [translatedText, setTranslatedText] = useState(title);

  useEffect(() => {
    let isMounted = true;
    if(i18n.language === 'en') {
      setTranslatedText(title);
      return;
    };
    const fetchTranslation = async () => {
      try {
        const response = await axios.post(BASE_URL, null, {
          params: {
            q: title,
            source: "en",
            target: i18n.language,
            key: language_key,
          },
        });

        console.log("Target Language:", i18n.language);
      console.log("Translating:", title);
      console.log("Response:", response.data.data);

        const translated = response.data.data.translations[0].translatedText;
        console.log("Translated Text:", translated);

          // Check if the component is still mounted before updating state
        if (isMounted && translated) {
            setTranslatedText(translated);
          } else {
            setTranslatedText(title); // Fallback to original text
          }
      } catch (error) {
        console.error("Translation Error:", error);
        setTranslatedText(title); // Fallback to original text
      }
    };

   
      fetchTranslation();
    

    return () => {
      isMounted = false;
    };
  }, [title, i18n.language]);

  return <>{translatedText}</>;
};

export default TranslateText;
