import type {
  BarteSDKConstructorProps,
  CardTokenData,
  TokenizeResult,
} from "./types";

export class BarteSDK {
  private publicKey: string;

  constructor({ publicKey }: BarteSDKConstructorProps) {
    if (!window)
      throw new Error(
        "Window is not defined, Barte SDK must be used in frontend context!"
      );

    if (!publicKey) throw new Error("API Key is required!");

    this.publicKey = publicKey;

    this.createIframe();
  }

  public cardToken({
    cardHolderName,
    cardCVV,
    cardExpiryDate,
    cardNumber,
    buyerUuid,
  }: CardTokenData): Promise<TokenizeResult> {
    if (cardNumber.length < 16) throw new Error("Invalid Card Number");

    if (!this.luhnValidator(cardNumber))
      throw new Error("Invalid Card Number Format");

    if (!buyerUuid) throw new Error("Invalid Buyer Uuid");

    if (!cardHolderName) throw new Error("Invalid Card Holder Name");

    if (!this.dateValidator(cardExpiryDate))
      throw new Error("Invalid date format");

    if (/\D/g.test(cardCVV) || cardCVV.length > 4 || cardCVV.length < 3)
      throw new Error("Invalid Card CVV");

    const iframe = this.getIFrame();

    if (!iframe) throw new Error("IFrame not mounted");
    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        window.removeEventListener("message", listener);

        const messageData = message.data;

        // TODO: Mapear outros cenários de erros possíveis aqui
        if (Array.isArray(messageData.errors) && messageData.errors.length)
          reject(messageData);

        resolve(messageData);
      };

      window.addEventListener("message", listener);

      iframe.contentWindow?.postMessage(
        {
          type: "submitForm",
          data: {
            holderName: cardHolderName.trim(),
            cvv: cardCVV,
            expiration: cardExpiryDate,
            number: cardNumber,
            buyerUuid,
            publicKey: this.publicKey,
          },
        },
        "*"
      );
    });
  }

  private getIFrame() {
    return document.getElementById(
      "barte-checkout-iframe"
    ) as HTMLIFrameElement;
  }

  private createIframe() {
    const iframeAlreadyExists = this.getIFrame();

    if (iframeAlreadyExists) {
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.src = "https://dev-sdk-client.barte.com";
    iframe.id = "barte-checkout-iframe";
    iframe.style = "display: none";

    const ROOT_ELEMENT = "body";

    const rootElement = document.querySelector(ROOT_ELEMENT);

    if (!rootElement) throw new Error(`Element ${ROOT_ELEMENT} not found!`);

    rootElement.appendChild(iframe);
  }

  private dateValidator(value: string) {
    const expirationDateRegex = /^(0[1-9]|1[0-2])\/(\d{4})$/;

    if (!expirationDateRegex.test(value)) return false;

    if (Number(value.substring(3, 7)) < new Date().getFullYear()) return false;

    if (Number(value.substring(0, 2)) < new Date().getMonth() + 1) return false;

    return true;
  }

  private luhnValidator(number: string) {
    const cleanNumber = number.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }
}

(window as any).BarteSDK = BarteSDK;
