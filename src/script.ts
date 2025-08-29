import { getEnv } from "./config/env";

window.addEventListener("DOMContentLoaded", () => {
  async function httpRequest(data: any) {
    const bodyData = { ...data };
    delete bodyData.accessToken;
    delete bodyData.environment;

    try {
      const requestResult = await fetch(getEnv(data.environment).apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token-Sdk": data.accessToken,
        },
        body: JSON.stringify(bodyData),
      });

      if (requestResult.status === 401)
        return {
          error: true,
          errorMessage:
            "Não autorizado! Token de autenticação inválido ou não disponibilizado.",
        };

      const result = await requestResult.json();

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

  window.addEventListener("message", async (ev) => {
    const eventData = ev.data;

    if (eventData.type === "submitForm") {
      const result = await httpRequest(eventData.data);
      window.parent.postMessage(result, "*");
    }
  });
});
