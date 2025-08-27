const API_URL = "https://dev-bff.barte.com/service/payment/v1/sdk/card-tokens";

async function tokenizeCardRequest(data: any) {
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

async function eventHandler(ev: MessageEvent<any>) {
  const eventData = ev.data;

  console.log(ev.origin);

  if (eventData.type === "submitForm") {
    // const result = await tokenizeCardRequest(eventData.data);
    const result = {
      error: false,
      data: {
        token: "aksdfjaksjdf",
      },
    };

    window.parent.postMessage(result, "http://localhost:5500/dist/parent.html");
  }
}

const getForm = (): HTMLFormElement | null =>
  document.getElementById("barte-tokenize-card-form") as HTMLFormElement;

function handleForm() {
  const form = getForm();

  if (form) {
    // const formData = Object.fromEntries(new FormData(form));
    const formElements = form.elements;
    // const elementsLength = formElements.length
    for (const element of formElements) console.log(element);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  handleForm();

  window.addEventListener("message", eventHandler);
});
