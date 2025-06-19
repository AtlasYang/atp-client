import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18NextLocalStorageBackend from "i18next-localstorage-backend";
import en from "./assets/locales/en";
import kr from "./assets/locales/kr";

const resources = {
  en: en,
  kr: kr,
  "ko-KR": kr,
  "en-US": en,
};

i18n
  .use(I18nextBrowserLanguageDetector)
  .use(I18NextLocalStorageBackend)
  .use(initReactI18next)
  .init({
    resources,
    ns: ["base"],
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
