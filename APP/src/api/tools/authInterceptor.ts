import { api } from ".";

let isRefreshing = false;
let failedQueue: Array<() => void> = [];

const processQueue = () => {
  failedQueue.forEach(cb => cb());
  failedQueue = [];
};

export const setupAuthInterceptor = (logout: () => void) => {
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("auth/refresh-token")
      ) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push(() => {
              api(originalRequest).then(resolve).catch(reject);
            });
          });
        }

        isRefreshing = true;

        try {
          await api.post("auth/refresh-token");
          processQueue();
          return api(originalRequest);
        } catch (refreshError) {
          console.warn("Refresh token expired or invalid", refreshError);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};