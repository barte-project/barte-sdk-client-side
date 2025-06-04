const NON_NUMBERS_REGEX = /\D/g;

const getCurrentYear = () => new Date().getFullYear() % 1000;

window.addEventListener("DOMContentLoaded", () => {
  let apiKey = ''

  async function httpRequest() {
    return "abacate12345"
  }

  // TODO: improve code
  window.addEventListener("message", async (ev) => {
    const eventData = ev.data

    if (eventData.type === "apiKey") {
      apiKey = eventData.apiKey
    }

    else if (eventData.type === "submitForm") {
      const result = await httpRequest(eventData.data)
      window.parent.postMessage({ cardToken: result }, "*");
    }
  });
});
