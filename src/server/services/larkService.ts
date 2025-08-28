import "dotenv/config";
import { Client } from "@larksuiteoapi/node-sdk";
import * as lark from "@larksuiteoapi/node-sdk";
import crypto from "crypto";
import type {
  LarkApiResponse,
  LarkJsApiTicketResponse,
  LarkUserInfo,
  ConfigParameters,
  LarkAppAccessTokenResponse
} from "@shared/types/lark.js";

// Configuration from environment
const APP_ID = process.env.LARK_APP_ID;
const APP_SECRET = process.env.LARK_APP_SECRET;

if (!APP_ID || !APP_SECRET) {
  throw new Error('Please set LARK_APP_ID and LARK_APP_SECRET in your environment variables');
}

// Random string for signature generation
const NONCE_STR = "13oEviLbrTo458A3NjrOwS70oTOXVOAm";

// Initialize Lark client
const client = new Client({
  appId: APP_ID,
  appSecret: APP_SECRET,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
});

/**
 * Get JSAPI configuration parameters for H5SDK
 * @param url - The current page URL for signature generation
 * @returns JSAPI configuration object
 */
export const getConfigParameters = async (url: string): Promise<ConfigParameters> => {
  const response = await client.request({
    url: '/open-apis/jssdk/ticket/get',
    method: 'GET',
  }) as LarkApiResponse<LarkJsApiTicketResponse>;

  const { ticket } = response.data!;
  const timestamp = Date.now();
  const signature = crypto
    .createHash('sha1')
    .update(`jsapi_ticket=${ticket}&noncestr=${NONCE_STR}&timestamp=${timestamp}&url=${url}`)
    .digest('hex');

  return {
    "appid": APP_ID,
    "ticket": ticket,
    "signature": signature,
    "noncestr": NONCE_STR,
    "timestamp": timestamp,
  };
};

/**
 * Get user info from authorization code
 * @param code - Authorization code from Lark OAuth flow
 * @returns User information object
 */
export const getLoginInfo = async (code: string): Promise<LarkUserInfo> => {
  // Get app access token using SDK method
  const appTokenResponse = await client.auth.appAccessToken.internal({
    data: {
      app_id: APP_ID,
      app_secret: APP_SECRET
    }
  }) as LarkAppAccessTokenResponse;

  if (appTokenResponse.code !== 0 || !appTokenResponse.app_access_token) {
    throw new Error(`Failed to get app access token: ${JSON.stringify(appTokenResponse)}`);
  }

  // Type assertion since SDK returns {} but we know the actual structure
  const appTokenData = appTokenResponse.app_access_token;

  // Get user access token using SDK method
  const userTokenResponse = await client.authen.accessToken.create({
    data: {
      grant_type: 'authorization_code',
      code
    }
  }, {
    headers: {
      Authorization: `Bearer ${appTokenData}`
    }
  });

  if (userTokenResponse.code !== 0 || !userTokenResponse.data?.access_token) {
    throw new Error(`Failed to exchange code for user token: ${JSON.stringify(userTokenResponse)}`);
  }

  // Type assertion for user access token
  const userTokenData = userTokenResponse.data.access_token;

  // Get user info using SDK method
  const userInfoResponse = await client.authen.userInfo.get({}, lark.withUserAccessToken(userTokenData));

  if (userInfoResponse.code !== 0 || !userInfoResponse.data) {
    throw new Error(`Failed to get user info: ${JSON.stringify(userInfoResponse)}`);
  }

  // Type assertion for user info
  const userData = userInfoResponse.data as LarkUserInfo;
  return userData;
};

/**
 * Get the Lark App ID
 * @returns The configured Lark App ID
 */
export const getAppId = (): string => {
  return APP_ID;
};

/**
 * Get the Lark client instance
 * @returns The configured Lark client
 */
export const getLarkClient = (): Client => {
  return client;
};
