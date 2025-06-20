window.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://sandbox-api.barte.com/v2/sdk/card-tokens";

  async function httpRequest(data: any) {
    const bodyData = { ...data };
    delete bodyData.accessToken;

    const requestResult = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token-Sdk": data.accessToken,
      },
      body: JSON.stringify(bodyData),
    });

    const result = await requestResult.json();

    return result;
  }

  window.addEventListener("message", async (ev) => {
    const eventData = ev.data;

    if (eventData.type === "submitForm") {
      const result = await httpRequest(eventData.data);
      window.parent.postMessage(
        result,
        "https://sandbox-sdk-client.barte.com/"
      );
    }
  });
});
