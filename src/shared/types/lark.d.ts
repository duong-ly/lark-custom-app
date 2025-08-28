/**
 * Lark SDK Type Definitions
 *
 * This file uses a hybrid approach:
 * 1. Leverages official @larksuiteoapi/node-sdk types where available
 * 2. Extends with custom types based on Lark API documentation
 * 3. Uses type assertions in implementation since SDK returns {} for data
 *
 * This ensures type safety while maintaining compatibility with the SDK.
 */

// Import types from the official Lark SDK
import type { Client } from "@larksuiteoapi/node-sdk";

// Infer types from the SDK client methods
type LarkClient = InstanceType<typeof Client>;

// Base API response structure (inferred from SDK)
export type LarkApiResponse<T = any> = {
  code?: number;
  msg?: string;
  data?: T;
};

export type LarkUserInfo = NonNullable<Awaited<ReturnType<LarkClient['authen']['userInfo']['get']>>['data']>;
export type LarkUserAccessToken = NonNullable<Awaited<ReturnType<LarkClient['authen']['accessToken']['create']>>['data']>;
// SDK method response types (the SDK uses {} for data, so we'll define our own based on API docs)
export type LarkAppAccessTokenResponse = {
  app_access_token: string;
  code: number;
  expire: number;
  msg: string;
  tenant_access_token: string;
};
export type LarkJsApiTicketResponse = {
  ticket: string;
  expire_in: number;
};


// Client-side H5SDK specific types (not in server SDK)
export interface LarkConfig {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

export interface LarkAuthResponse {
  code: string;
}

export interface LarkErrorResponse {
  errorCode: number;
  errorMessage: string;
  errno?: number;
  errString?: string;
}

export interface ConfigParameters {
  appid: string;
  ticket: string;
  signature: string;
  noncestr: string;
  timestamp: number;
}

// Global declarations for Lark H5SDK
declare global {
  interface Window {
    h5sdk: {
      config: (config: LarkConfig) => void;
      ready: (callback: () => void) => void;
      error: (callback: (err: LarkErrorResponse) => void) => void;
    };
    tt: {
      requestAuthCode: (options: {
        appId: string;
        success: (res: LarkAuthResponse) => void;
        fail: (err: LarkErrorResponse) => void;
      }) => void;
      requestAccess: (options: {
        appID: string;
        scopeList: string[];
        success: (res: LarkAuthResponse) => void;
        fail: (err: LarkErrorResponse) => void;
      }) => void;
    };
  }
}

export {};
