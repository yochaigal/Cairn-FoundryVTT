const path = require('path');

module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jquery": true
    },
    "extends": [
      "eslint:recommended",
      "@typhonjs-fvtt/eslint-config-foundry.js",
      "plugin:i18n-json/recommended",
      "plugin:import/errors",
      "plugin:import/warnings"
    ],
    "plugins": ["import"],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
      "prefer-const": 2,
      "i18n-json/valid-message-syntax": [
        2,
        {
          "syntax": "icu"
        }
      ],
      "i18n-json/valid-json": 2,
      "i18n-json/sorted-keys": [
        2,
        {
          "order": "asc",
          "indentSpaces": 2
        }
      ],
      "i18n-json/identical-keys": [2, {
        filePath: path.resolve('lang/en.json')
      }],
      "no-return-await": "error"
    }
}
