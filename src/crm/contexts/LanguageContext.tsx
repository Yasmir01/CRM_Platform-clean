import React, { createContext, useContext, useState } from "react";
import i18n from "../../i18n";

type LanguageContextProps = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  changeLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
