import "dotenv/config";
import jwt from "jsonwebtoken";
import type {
  EmbedTokenPayload,
  EmbedTokenResponse,
  EmbedUrlResponse,
  EmbedUserAttributes
} from "@shared/types/embed.js";

/**
 * Build Holistics embed JWT
 * @param userAttributes - User information containing email
 * @returns Token and expiration information
 */
export function buildEmbedToken(userAttributes: EmbedUserAttributes): EmbedTokenResponse {
  const secret = process.env.EMBED_SECRET;
  if (!secret) throw new Error("Missing EMBED_SECRET");

  const portalName = process.env.EMBED_PORTAL_NAME;
  if (!portalName) throw new Error("Missing EMBED_PORTAL_NAME");

  const EXP_S = 15 * 60; // 15 minutes
  const now = Math.floor(Date.now() / 1000);

  const payload: EmbedTokenPayload = {
    object_name: portalName,
    object_type: "EmbedPortal",
    user_attributes: {
      email: userAttributes.email,
    },
    permissions: {},
    exp: now + EXP_S,
    settings: {
      allow_raw_data_export: false,
      allow_dashboard_export: false,
      default_timezone: null,
      allow_dashboard_timezone_change: false,
      hide_dashboard_filters_controls_panel: false
    }
  };

  const token = jwt.sign(payload, secret);
  return { token, exp: payload.exp };
}

/**
 * Generate embed URL with token
 * @param userAttributes - User information including email
 * @param token - Embed token
 * @param exp - Token expiration timestamp
 * @returns Complete embed URL response
 */
export function generateEmbedUrl(
  userAttributes: EmbedUserAttributes,
  token: string,
  exp: number
): EmbedUrlResponse {
  const base = (process.env.EMBED_BASE || "").replace(/\/$/, "");
  const path = process.env.EMBED_HASHCODE || "";
  const url = `${base}/${path}?_token=${encodeURIComponent(token)}`;

  return {
    url,
    token,
    exp,
    userAttributes
  };
}

/**
 * Create embed URL from user information
 * @param userAttributes - User information containing email
 * @returns Complete embed URL response with token
 */
export function createEmbedUrl(userAttributes: EmbedUserAttributes): EmbedUrlResponse {
  const { token, exp } = buildEmbedToken(userAttributes);
  return generateEmbedUrl(userAttributes, token, exp);
}
