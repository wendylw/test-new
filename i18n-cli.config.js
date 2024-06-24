/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const path = require('path');

module.exports = {
  projectId: '331737',
  projectName: 'beep-v1-web',
  languages: ['en', 'th'],
  allowIncompleteIn: [],
  notification: {
    webhook: 'https://open.larksuite.com/open-apis/bot/v2/hook/3e5cba56-6a83-429f-b87d-e951d515193c',
  },
  proofreadRules: {
    htmlLike: true,
    printf: true,
    braces: true,
    stringEscape: true,
  },
  adaptor: {
    read() {
      const dirname = path.join(__dirname, 'public/locales/en');
      const filenames = fs.readdirSync(dirname);
      const termsMap = {};
      filenames.forEach(filename => {
        const key = filename.replace('.json', '');
        const content = JSON.parse(fs.readFileSync(path.join(dirname, filename), { encoding: 'utf8' }));
        termsMap[key] = content;
      });
      return termsMap;
    },

    write(translations) {
      const localeDir = path.join(__dirname, 'public/locales');
      Object.keys(translations).forEach(languageCode => {
        if (languageCode !== 'en') {
          const languageDir = path.join(localeDir, languageCode);
          if (!fs.existsSync(languageDir)) {
            fs.mkdirSync(languageDir);
          }
          const termsMap = translations[languageCode];
          Object.keys(termsMap).forEach(namespace => {
            fs.writeFileSync(
              path.join(languageDir, `${namespace}.json`),
              JSON.stringify(termsMap[namespace], null, 2),
              {
                encoding: 'utf8',
                flag: 'w',
              }
            );
          });
        }
      });
    },
  },
};
