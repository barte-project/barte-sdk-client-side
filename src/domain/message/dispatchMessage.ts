import { validateEnvironment } from "../../config/env";
import { createIframe } from "../payment/token/iframe";
import { EventDataRequest, EventType } from "./types";

export type DispatchResultType =
  | {
      type: EventType;
      error: boolean;
      data?: undefined;
      errorMessage: string;
      errorDetails: any;
    }
  | {
      type: EventType;
      error: boolean;
      data: any;
      errorMessage?: undefined;
      errorDetails?: undefined;
    }
  | {
      type: EventType;
      error: boolean;
      errorMessage: unknown;
      errorDetails?: undefined;
      data?: undefined;
    };

export async function dispatchScriptMessage(data: EventDataRequest) {
  validateEnvironment(data.config.environment);

  const iframe = await createIframe();

  iframe.contentWindow?.postMessage(data, Env.SDK_IFRAME_URL);
}

export function dispatchScriptResultMessage(data: DispatchResultType) {
  window.parent.postMessage(data, "*");
}
