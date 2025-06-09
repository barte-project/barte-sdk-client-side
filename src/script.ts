window.addEventListener("DOMContentLoaded", () => {
  let apiKey = "";
  const API_URL = "https://dev-bff.barte.com/service/payment/v1/cards";

  async function httpRequest(data: any) {
    const requestResult = await fetch(API_URL, {
      method: "POST",
      headers: {
        "X-Token-Api": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await requestResult.json();

    return result;
  }

  window.addEventListener("message", async (ev) => {
    const eventData = ev.data;

    if (eventData.type === "apiKey") {
      apiKey = eventData.apiKey;
    } else if (eventData.type === "submitForm") {
      const result = await httpRequest(eventData.data);
      window.parent.postMessage(result, "*");
    }
  });
});
