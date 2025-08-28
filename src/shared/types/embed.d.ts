// Type definitions for Holistics Embed
export type EmbedUserAttributes = {
  email?: string;
};

export interface EmbedTokenPayload {
  object_name: string;
  object_type: string;
  user_attributes: EmbedUserAttributes;
  permissions: Record<string, any>;
  exp: number;
  settings: {
    allow_raw_data_export: boolean;
    allow_dashboard_export: boolean;
    default_timezone: string | null;
    allow_dashboard_timezone_change: boolean;
    hide_dashboard_filters_controls_panel: boolean;
  };
}

export interface EmbedTokenResponse {
  token: string;
  exp: number;
}

export interface EmbedUrlResponse extends EmbedTokenResponse {
  url: string;
  userAttributes: EmbedUserAttributes;
}

export {};
