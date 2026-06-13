/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VERSION: string;
  readonly VITE_PRODUCTION: string;
  readonly VITE_CREDENTIALS_KEY: string;
  readonly VITE_PATH_PARAMS_KEY: string;
  readonly VITE_OAUTH_STORAGE_KEY: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_MOCK_AUTH?: string;
  readonly VITE_MOCK_MENU?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
