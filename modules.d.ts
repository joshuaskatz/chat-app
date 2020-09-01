declare namespace NodeJS {
  export interface ProcessEnv {
    DB_TYPE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    SESSION_COOKIE: string;
    FRONTEND_URL: string;
  }
}
