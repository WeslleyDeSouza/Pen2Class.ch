require("dotenv").config();

const LANGUAGE_DEFAULT_IDS_APP = [
  { languageId: 1, name: "de" },
  { languageId: 2, name: "en" },
  { languageId: 3, name: "fr" },
  { languageId: 4, name: "it" },
  { languageId: 5, name: "es" },
  { languageId: 6, name: "pt-br" },
  { languageId: 17, name: 'sq' },        // Albanian
  /*
  { languageId: 7, name: 'zh-cn' },
  { languageId: 8, name: 'ru' },
  { languageId: 9, name: 'ko' },
  { languageId: 10, name: "ta" },
  { languageId: 11, name: "tr" },
  { languageId: 12, name: "th" },
  { languageId: 13, name: 'hi' },        // Hindi
  { languageId: 14, name: 'bn' },        // Bengali
  { languageId: 15, name: 'ar' },        // Arabic
  { languageId: 16, name: 'ja' },        // Japanese
  { languageId: 17, name: 'sq' },        // Albanian
  { languageId: 18, name: 'hr' },        // Croatia
  { languageId: 19, name: 'el' },        // Greek
   */
];

module.exports = {
  baseLocale: "de",
  locales: LANGUAGE_DEFAULT_IDS_APP.map(r => r.name.toLowerCase()).filter(
    a => !["de"].includes(a)
  ),
  localePath: "../libs/app/assets/locales/",
  openAIApiKey: process.env["OPEN_API_KEY"] || process.env["OPENAI_API_KEY"],
  overrides: {},
  context: " ",
};
