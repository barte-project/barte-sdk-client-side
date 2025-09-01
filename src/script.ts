import { getEnv } from "./config/env";
import ApiClient from "./domain/payment/checkout/wallet/api";
import { configHttpProps } from "./types";

window.addEventListener("DOMContentLoaded", () => {
  async function httpRequestToken(data: any) {
    try {
      const requestResult = await fetch(getEnv(data.config.environment).apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token-Sdk": data.config.accessToken,
        },
        body: JSON.stringify(data.data),

      });

      const result = await requestResult.json();

      if (result.errors && Array.isArray(result.errors) && result.errors.length)
        return {
          error: true,
          errorMessage: "Erro ao tokenizar cartão!",
          errorDetails: result.errors,
        };

      return {
        error: false,
        data: result,
      };
    } catch (error) {
      return {
        error: true,
        errorMessage: error,
      };
    }
  }
  const apiClient = (config: configHttpProps) => {
    return new ApiClient({ accessToken: config.accessToken, environment: config.environment })
  }
  window.addEventListener("message", async (ev) => {
    const eventData = ev.data;
    const api = apiClient(eventData.config);
    if (eventData.type === "submitTokenForm") {
      const result = await httpRequestToken(eventData.data);
      window.parent.postMessage(result, "*");
    }
    if (eventData.type === "submitCreateBuyer") {
      const result = await api.createBuyerYuno(eventData.data);
      window.parent.postMessage(result, "*");
    }
    if (eventData.type === "submitCreateSession") {
      const result = await api.createSession(eventData.data)
      window.parent.postMessage(result, "*");
    }
    if (eventData.type === "submitCreatePayment") {
      const result = await api.createPaymentOrder(eventData.data)
      window.parent.postMessage(result, "*");
    }
  });
});
