export const ENV = {
  API_BASE_URL: 'http://10.163.187.187:8082',
  API_TIMEOUT: 10000,
  NODE_ENV: 'development',
} as const;

export type Environment = typeof ENV;
