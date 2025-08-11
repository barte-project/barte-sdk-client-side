window.addEventListener("DOMContentLoaded", () => {
  const API_URL = import.meta.env.apiUrl;

  async function httpRequest(data: any) {
    const bodyData = { ...data };
    delete bodyData.accessToken;

    try {
      const requestResult = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token-Sdk": data.accessToken,
        },
        body: JSON.stringify(bodyData),
      });

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
      window.parent.postMessage(result, import.meta.env.iframeUrl);
    }
  });
});
