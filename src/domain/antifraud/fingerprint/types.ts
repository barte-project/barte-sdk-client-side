import { AntifraudService } from "../types";

export type BarteFingerPrintResult = {
  userAgent: string;
  language: string;
  colorDepth: number;
  screenHeight: number;
  screenWidth: number;
  timeZoneOffset: string;

  os: string;
  ramCapacity: number;
  model: string;
  resolution: string;
  browser: string;
  version: string;

  javaEnabled: boolean;
  javaScriptEnabled: boolean;
};

export type HTMLHandlerProps = { antifraudService: AntifraudService };

export type CreateScriptProps = {
  src: string;
  id: string;
  async?: boolean;
  crossOrigin?: string;
};

export type AccessTokenPayload = {
  sellerId: number;
  antifraudService: AntifraudService;
};
