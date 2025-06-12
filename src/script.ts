window.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://dev-bff.barte.com/service/payment/public/cards";

  async function httpRequest(data: any) {
    const requestResult = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await requestResult.json();

    return result;
  }

  window.addEventListener("message", async (ev) => {
    const eventData = ev.data;

    if (eventData.type === "submitForm") {
      const result = await httpRequest(eventData.data);
      window.parent.postMessage(result, "*");
    }
  });
});
