import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      payments: "Payments",
      maintenance: "Maintenance",
      settings: "Settings",
    },
  },
  es: {
    translation: {
      welcome: "Bienvenido",
      payments: "Pagos",
      maintenance: "Mantenimiento",
      settings: "Configuraciones",
    },
  },
  fr: {
    translation: {
      welcome: "Bienvenue",
      payments: "Paiements",
      maintenance: "Entretien",
      settings: "Paramètres",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
