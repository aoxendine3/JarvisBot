const locales = require('../locales.cjs');

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    dim: "\x1b[2m"
};

const sysLang = (process.env.LANG || process.env.LC_ALL || 'en').split('_')[0].toLowerCase();
const langIdx = process.argv.indexOf('--lang');
const lang = langIdx !== -1 ? process.argv[langIdx + 1] : sysLang;

const t = (key, params = {}) => {
  let msg = locales[lang]?.[key] || locales.en[key] || key;
  for (const k in params) msg = msg.replace(`{${k}}`, params[k]);
  return msg;
};

module.exports = { colors, t, lang };
