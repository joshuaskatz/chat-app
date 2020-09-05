declare namespace NodeJS {
  export interface ProcessEnv {
    DB_TYPE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
  }
}
