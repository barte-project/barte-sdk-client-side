import type {
  BarteSDKConstructorProps,
  CardTokenData,
  TokenizeResult,
} from "./types";

export class BarteSDK {
  private accessToken: string;

  constructor({ accessToken }: BarteSDKConstructorProps) {
    if (!window)
      throw new Error(
        "Window is not defined, Barte SDK must be used in frontend context!"
      );

    if (!accessToken) throw new Error("Access Token is required!");

    this.accessToken = accessToken;

    // this.iframeReady = this.createIframe();
  }

  public async cardToken({
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

    const iframe = await this.createIframe();

    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        window.removeEventListener("message", listener);

        if (!message.data.error) {
          const messageData = message.data;

          // TODO: Mapear outros cenários de erros possíveis aqui
          if (Array.isArray(messageData.errors) && messageData.errors.length)
            reject(messageData);

          console.log({ messageData });
          resolve(messageData);
        }
        reject(message.data);
        this.getIFrame().remove();
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
            accessToken: this.accessToken,
          },
        },
        "https://sandbox-sdk-client.barte.com/script.min.js"
      );
    });
  }

  private getIFrame() {
    return document.getElementById(
      "barte-checkout-iframe"
    ) as HTMLIFrameElement;
  }

  private createIframe(): Promise<HTMLIFrameElement> {
    return new Promise((resolve, reject) => {
      this.getIFrame()?.remove();
      const iframe = document.createElement("iframe");
      iframe.src = "https://sandbox-sdk-client.barte.com";
      iframe.id = "barte-checkout-iframe";
      iframe.style = "display: none";

      iframe.onload = () => resolve(iframe);

      iframe.onerror = () => reject(new Error("Erro ao carregar iframe"));

      const container = document.querySelector("body");
      if (!container) {
        reject(new Error("Elemento body não encontrado!"));
        return;
      }

      container.appendChild(iframe);
    });
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
