import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getSessionToken } from './session';

/**
 * Auto-detect Base API URL for Spring Boot Backend:
 * - Web: http://localhost:8080
 * - Android Emulator: http://10.0.2.2:8080
 * - Physical Phone via Expo: http://<DEVELOPER_COMPUTER_IP>:8080
 */
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }

  // 1. Try Expo hostUri for Physical Devices / Expo Go
  const hostUri = Constants.expoConfig?.hostUri || Constants.experienceUrl;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8080`;
    }
  }

  // 2. Local Wi-Fi IP / Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.224.89.52:8080';
  }

  return 'http://10.224.89.52:8080';
};

export const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function tryFetchUrl<T = any>(
  fullUrl: string,
  options: RequestInit,
  headers: Record<string, string>,
  timeoutMs = 25000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = data?.message || data?.error;
      if (!errorMessage && data?.errors) {
        if (typeof data.errors === 'object') {
          errorMessage = Object.values(data.errors).join('. ');
        } else if (Array.isArray(data.errors)) {
          errorMessage = data.errors.join('. ');
        }
      }
      if (!errorMessage) {
        errorMessage = `HTTP error ${response.status}`;
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}

let cachedWorkingBaseUrl: string | null = null;

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getSessionToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const primaryUrl = endpoint.startsWith('http')
    ? endpoint
    : cachedWorkingBaseUrl
    ? `${cachedWorkingBaseUrl}${endpoint}`
    : `${API_BASE_URL}${endpoint}`;

  const candidateUrls: string[] = [primaryUrl];
  if (!endpoint.startsWith('http')) {
    const fallbacks = [
      `http://10.224.89.52:8080${endpoint}`,
      `http://10.0.2.2:8080${endpoint}`,
      `http://localhost:8080${endpoint}`,
    ];
    for (const fb of fallbacks) {
      if (!candidateUrls.includes(fb)) {
        candidateUrls.push(fb);
      }
    }
  }

  let lastError: any = null;
  for (const targetUrl of candidateUrls) {
    try {
      const result = await tryFetchUrl<T>(targetUrl, options, headers, 4000);
      if (!endpoint.startsWith('http')) {
        const urlObj = targetUrl.replace(endpoint, '');
        if (urlObj && urlObj.startsWith('http')) {
          cachedWorkingBaseUrl = urlObj;
        }
      }
      return result;
    } catch (err: any) {
      if (err instanceof ApiError && err.status !== 0 && err.status !== 408) {
        throw err;
      }
      lastError = err;
    }
  }

  if (lastError instanceof ApiError) {
    throw lastError;
  }
  throw new ApiError('Unable to connect to backend server. Please verify Spring Boot server is running.', 0);
}

export async function fetchWithAuth<T = any>(endpoint: string, options: RequestInit = {}): Promise<{ ok: boolean; status: number; json: () => Promise<T> }> {
  try {
    const data = await request<T>(endpoint, options);
    return {
      ok: true,
      status: 200,
      json: async () => data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: err.status || 500,
      json: async () => ({ message: err.message } as any),
    };
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  put: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  patch: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'DELETE', headers }),
};

export async function uploadFileToBackend(fileUri: string, fileName?: string, fileType?: string): Promise<string> {
  const token = getSessionToken();
  const filename = fileName || fileUri.split('/').pop() || `file_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  let mimeType = 'image/jpeg';
  if (fileType && fileType.includes('/')) {
    mimeType = fileType;
  } else if (ext === 'png') {
    mimeType = 'image/png';
  } else if (ext === 'gif') {
    mimeType = 'image/gif';
  } else if (ext === 'webp') {
    mimeType = 'image/webp';
  } else if (ext === 'mp4') {
    mimeType = 'video/mp4';
  } else if (ext === 'mov') {
    mimeType = 'video/quicktime';
  } else {
    mimeType = 'image/jpeg';
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.experienceUrl;
  let detectedIp: string | null = null;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      detectedIp = ip;
    }
  }

  let rawCandidates: string[] = [
    `http://10.224.89.52:8080/api/files/upload`,
    ...(detectedIp ? [`http://${detectedIp}:8080/api/files/upload`] : []),
    `http://10.0.2.2:8080/api/files/upload`,
    `${API_BASE_URL}/api/files/upload`,
  ];

  if (Platform.OS === 'web') {
    rawCandidates.push(`http://localhost:8080/api/files/upload`);
  }

  const candidateUrls: string[] = Array.from(new Set(rawCandidates)).filter((url) => {
    if (Platform.OS !== 'web' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
      return false;
    }
    return true;
  });

  let attemptLogs: string[] = [];

  for (const targetUrl of candidateUrls) {
    try {
      console.log(`[Upload] Attempting upload to ${targetUrl} (URI: ${fileUri})`);
      const result = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', targetUrl);
        xhr.timeout = 15000;

        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log(`[Upload Success] ${targetUrl} -> ${xhr.responseText}`);
            resolve(xhr.responseText.trim());
          } else {
            console.error(`[Upload HTTP Error] ${targetUrl} status ${xhr.status}: ${xhr.responseText}`);
            reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
          }
        };

        xhr.onerror = (e) => {
          console.error(`[Upload Network Error] ${targetUrl}`, e);
          reject(new Error(`Connection failed to ${targetUrl}`));
        };

        xhr.ontimeout = () => {
          console.error(`[Upload Timeout] ${targetUrl}`);
          reject(new Error(`Timeout on ${targetUrl}`));
        };

        const formData = new FormData();
        formData.append('file', {
          uri: fileUri,
          name: filename,
          type: mimeType,
        } as any);

        xhr.send(formData);
      });

      return result;
    } catch (err: any) {
      console.warn(`[Upload Attempt Failed] ${targetUrl}:`, err.message);
      attemptLogs.push(`${targetUrl} -> ${err.message}`);
      if (err.message && err.message.startsWith('HTTP')) {
        throw err;
      }
    }
  }

  const detailedMsg = `File upload failed across endpoints:\n` + attemptLogs.join('\n');
  console.error(detailedMsg);
  throw new Error(detailedMsg);
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('file:') || url.startsWith('content:') || url.startsWith('data:')) {
    return url;
  }
  const workingHost = cachedWorkingBaseUrl || API_BASE_URL;
  if (url.includes('/api/files/')) {
    const fileSubpath = url.substring(url.indexOf('/api/files/'));
    return `${workingHost}${fileSubpath}`;
  }
  if (url.startsWith('http://localhost:8080') || url.startsWith('http://127.0.0.1:8080')) {
    return url.replace(/http:\/\/(localhost|127\.0\.0\.1):8080/, workingHost);
  }
  if (url.startsWith('/')) {
    return `${workingHost}${url}`;
  }
  return url;
}
