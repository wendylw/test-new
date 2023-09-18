const fs = require('fs-extra');
const path = require('path');

module.exports = {
  projectId: '331737',
  languages: ['en', 'th'],
  adaptor: {
    read() {
      const dirname = path.join(__dirname, 'public/locales/en');
      const filenames = fs.readdirSync(dirname);
      const termsMap = {};
      filenames.forEach(filename => {
        const key = filename.replace('.json', '');
        const content = fs.readJSONSync(path.join(dirname, filename));
        termsMap[key] = content;
      });
      return termsMap;
    },

    write(translations) {
      const localeDir = path.join(__dirname, 'public/locales');
      for (const languageCode in translations) {
        if (languageCode !== 'en') {
          fs.ensureDirSync(path.join(localeDir, languageCode));
          const termsMap = translations[languageCode];
          for (const namespace in termsMap) {
            fs.writeJSONSync(path.join(localeDir, languageCode, `${namespace}.json`), termsMap[namespace], {
              spaces: 2,
              flag: 'w',
            });
          }
        }
      }
    },
  },
};
