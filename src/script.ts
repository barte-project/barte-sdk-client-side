import { dateValidator, luhnValidator } from "./utils";

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

const inputNames = [
  "cardName",
  "cardNumber",
  "cardDueDate",
  "cardCvv",
] as const;

type FormKeyName = (typeof inputNames)[number];

function handleForm() {
  const form = getForm();

  const obj = {} as Record<
    FormKeyName,
    { valid: boolean; errorMessage?: string }
  >;

  if (form) {
    const formElements = form.elements;

    for (const element of formElements) {
      element.addEventListener("keyup", (e) => {
        // @ts-ignore
        const value = e.target.value;

        // @ts-ignore
        const name = e.target.name;

        // @ts-ignore
        const isRequired = e.target.hasAttribute("required");

        if (isRequired && inputNames.includes(name)) {
          const setSuccess = () =>
            (obj[name as FormKeyName] = {
              valid: true,
              errorMessage: undefined,
            });

          const setError = (errorMessage: string) =>
            (obj[name as FormKeyName] = {
              valid: false,
              errorMessage,
            });

          switch (name as FormKeyName) {
            case "cardCvv":
              if (value.length > 0 && value && value.length < 5) setSuccess();
              else setError("Número de CVV inválido");
              break;

            case "cardDueDate":
              if (dateValidator(value)) setSuccess();
              else setError("Data de vencimento inválida");
              break;

            case "cardName":
              if (value.length > 0) setSuccess();
              else setError("Nome inválido");
              break;

            case "cardNumber":
              if (luhnValidator(value)) setSuccess();
              else setError("Número de cartão inválido");
              break;
          }
        }

        const entries = Object.entries(obj);

        const entriesLength = entries.length;

        let allEntriesAreValid = entries.every((v) => v[1].valid);

        if (allEntriesAreValid && entriesLength === inputNames.length) {
          console.log("Submit form!");
        }
      });
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  handleForm();

  window.addEventListener("message", eventHandler);
});
