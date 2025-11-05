{
  "name": "eslint.config",
  "version": "9.36.0",
  "type": "module",
  "configs": {
    "recommended": {
      "languageOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "globals": {
          "console": "readonly",
          "process": "readonly",
          "Buffer": "readonly",
          "__dirname": "readonly",
          "__filename": "readonly",
          "global": "readonly",
          "module": "readonly",
          "require": "readonly",
          "exports": "readonly"
        }
      },
      "rules": {
        "no-unused-vars": "warn",
        "no-console": "off"
      }
    }
  }
}

