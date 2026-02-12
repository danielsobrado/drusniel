import { useState, createContext, useEffect } from 'react';

export const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // Default language 'en'

  useEffect(() => {
    // Update the language in the document's HTML lang attribute
    document.documentElement.lang = language;

    // Update the language in the local storage
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};