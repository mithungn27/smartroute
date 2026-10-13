/**
 * Shared API configuration for SMART-ROUTE Mobile.
 * Centralizes the backend base URL so that all screens use the same configuration.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.26.248.228:5000";

// Aliases for compatibility across screens
export const API_URL = API_BASE_URL;
export const API = API_BASE_URL;

export default API_BASE_URL;
