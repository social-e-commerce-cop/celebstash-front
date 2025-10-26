export const ENV = {
  API_BASE_URL: 'http://192.168.110.240:8082',
  API_TIMEOUT: 10000,
  NODE_ENV: 'development',
} as const;

export type Environment = typeof ENV;
