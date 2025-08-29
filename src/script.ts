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

  window.addEventListener("message", async (ev) => {
    const eventData = ev.data;

    if (eventData.type === "submitForm") {
      const result = await httpRequest(eventData.data);
      window.parent.postMessage(result, "*");
    }
  });
});
