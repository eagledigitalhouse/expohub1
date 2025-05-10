import { IconName } from "./types";

export const APP_NAME = "Central de Recursos";
export const DEFAULT_THEME = "dark";

export const MOBILE_BREAKPOINT = 768;
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_WIDTH_ICON = "3rem";

export const TOAST_LIMIT = 1;
export const TOAST_REMOVE_DELAY = 1000000;

export const ICON_MAP: Record<string, IconName> = {
  CHECKLIST: "FileCheck",
  DOCUMENT: "FileText",
  GUIDE: "Info",
  SCHEDULE: "Clock",
  CONTACT: "Users",
  GRAPHIC: "Image",
  ANNOUNCEMENT: "MegaPhone",
  DEFAULT: "FileText"
};

export const API_ENDPOINTS = {
  CATEGORIES: "/api/categories",
  RESOURCES: "/api/resources",
  BLOCKS: "/api/blocks",
  THEME_SETTINGS: "/api/theme-settings"
} as const;