import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig
} from 'axios';

/**
 * 后端通用响应结构。
 */
interface ApiEnvelope<T = unknown> {
  code?: number;
  msg?: string;
  data?: T;
  error?: string;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

function getDeviceId(): string {
  const key = 'device_id';
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, id);
  return id;
}

function redirectToLogin() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  const current = `${window.location.pathname}${window.location.search}`;
  const target = `/login?redirect=${encodeURIComponent(current)}`;

  if (!window.location.pathname.startsWith('/login')) {
    window.location.replace(target);
  }
}

const instance = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Device-ID'] = getDeviceId();
  return config;
});

function unwrapResponse<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object') {
    const obj = payload as ApiEnvelope<T>;

    if (typeof obj.code === 'number') {
      if (obj.code === 0) {
        return (obj.data as T) ?? ({} as T);
      }

      if (obj.code === 401) {
        redirectToLogin();
      }

      throw new Error(obj.msg || '请求失败');
    }

    if (Object.prototype.hasOwnProperty.call(obj, 'data') && Object.keys(obj).length === 1) {
      return obj.data as T;
    }

    if (typeof obj.error === 'string' && obj.error.trim()) {
      throw new Error(obj.error);
    }
  }

  return payload as T;
}

instance.interceptors.response.use(
  (response) => unwrapResponse(response.data),
  (error: AxiosError<ApiEnvelope>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      redirectToLogin();
      return Promise.reject(new Error('登录状态已过期，请重新登录'));
    }

    if (status === 403) {
      return Promise.reject(new Error(data?.msg || data?.error || '没有权限访问该资源'));
    }

    if (status === 404) {
      return Promise.reject(new Error(data?.msg || data?.error || '请求的资源不存在'));
    }

    if (status && status >= 500) {
      return Promise.reject(new Error(data?.msg || data?.error || '服务器内部错误'));
    }

    return Promise.reject(new Error(data?.msg || data?.error || error.message || '网络请求失败'));
  }
);

/**
 * 对 axios 做一次轻量封装，确保调用处直接拿到业务数据而不是 AxiosResponse。
 */
const http = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config) as unknown as Promise<T>;
  },

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config) as unknown as Promise<T>;
  },

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config) as unknown as Promise<T>;
  },

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.patch(url, data, config) as unknown as Promise<T>;
  },

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config) as unknown as Promise<T>;
  }
};

export default http;
