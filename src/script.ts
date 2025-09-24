import { getEnv } from "./config/env";
import ApiClient from "./domain/payment/checkout/wallet/api";
import { EventDataRequest, EventConfigProps } from "./domain/message/types";
import { isEventValid } from "./domain/message/utils";
import {
  DispatchResultType,
  dispatchScriptResultMessage,
} from "./domain/message/dispatchMessage";

window.addEventListener("DOMContentLoaded", () => {
  async function httpRequestToken(
    data: EventDataRequest
  ): Promise<DispatchResultType> {
    try {
      const requestResult = await fetch(
        getEnv(data.config.environment).apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Token-Sdk": data.config.accessToken,
          },
          body: JSON.stringify(data.data),
        }
      );

      const result = await requestResult.json();

      if (result.errors && Array.isArray(result.errors) && result.errors.length)
        return {
          type: "submitTokenForm",
          error: true,
          errorMessage: "Erro ao tokenizar cartão!",
          errorDetails: result.errors,
        };

      return {
        type: "submitTokenForm",
        error: false,
        data: result,
      };
    } catch (error) {
      return {
        type: "submitTokenForm",
        error: true,
        errorMessage: error,
      };
    }
  }

  const apiClient = (config: EventConfigProps) => {
    return new ApiClient({
      accessToken: config.accessToken,
      environment: config.environment,
    });
  };

  window.addEventListener(
    "message",
    async (ev: MessageEvent<EventDataRequest>) => {
      const eventData = ev.data;
      const api = apiClient(eventData.config);

      if (!isEventValid(ev.data?.type)) return;

      if (eventData.type === "submitTokenForm") {
        const result = await httpRequestToken(eventData);

        dispatchScriptResultMessage(result);
      }

      if (eventData.type === "submitCreateSession") {
        const result = await api.createSession(eventData.data);

        dispatchScriptResultMessage({
          type: "submitCreateSession",
          error: false,
          data: result,
        });
      }

      if (eventData.type === "submitCreatePayment") {
        await api.createPaymentOrder(eventData.data);

        dispatchScriptResultMessage({
          type: "submitCreatePayment",
          error: false,
          data: "Order Criada com sucesso!",
        });
      }
    }
  );
});
