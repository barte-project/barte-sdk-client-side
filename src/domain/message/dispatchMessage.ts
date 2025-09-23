import { validateEnvironment } from "../../config/env";
import { createIframe } from "../payment/token/iframe";
import { EventDataRequest } from "./types";

export async function dispatchScriptMessage(data: EventDataRequest) {
  validateEnvironment(data.config.environment);

  const iframe = await createIframe();

  iframe.contentWindow?.postMessage(data, Env.SDK_IFRAME_URL);
}
