/**
 * Unauthenticated API Service for React Native
 *
 * Dedicated axios client for public endpoints (auth/reset/verification)
 * without token interceptors.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import config from '../config/config';
import DeviceIdService from './DeviceIdService';

class UnauthenticatedApiService {
  private static instance: UnauthenticatedApiService;
  private axiosInstance: AxiosInstance;
  private deviceIdService: DeviceIdService;

  private constructor() {
    this.deviceIdService = DeviceIdService.getInstance();
    this.axiosInstance = axios.create({
      baseURL: config.backendEndpoint,
      timeout: config.apiTimeout,
    });

    this.setupInterceptors();
  }

  public static getInstance(): UnauthenticatedApiService {
    if (!UnauthenticatedApiService.instance) {
      UnauthenticatedApiService.instance = new UnauthenticatedApiService();
    }
    return UnauthenticatedApiService.instance;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(async (requestConfig) => {
      const deviceId = await this.deviceIdService.getDeviceId();
      requestConfig.headers['X-Device-ID'] = deviceId;

      if (!requestConfig.headers['Content-Type'] && !(requestConfig.data instanceof FormData)) {
        requestConfig.headers['Content-Type'] = 'application/json';
      }

      return requestConfig;
    });
  }

  public async get<T = any>(url: string, requestConfig?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url, requestConfig);
  }

  public async post<T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data, requestConfig);
  }

  public async put<T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put(url, data, requestConfig);
  }

  public async patch<T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch(url, data, requestConfig);
  }

  public async delete<T = any>(url: string, requestConfig?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url, requestConfig);
  }
}

export default UnauthenticatedApiService;
