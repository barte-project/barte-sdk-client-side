import type { CardTokenData, TokenizeResult } from "./types";
import { Iframe } from "../iframe/index";
import { dateValidator, luhnValidator } from "./utils";

export class Card {
  constructor(private accessToken: string) {}

  public async cardToken({
    cardHolderName,
    cardCVV,
    cardExpiryDate,
    cardNumber,
    buyerUuid,
  }: CardTokenData): Promise<TokenizeResult> {
    if (cardNumber.length < 16) throw new Error("Invalid Card Number");

    if (!luhnValidator(cardNumber))
      throw new Error("Invalid Card Number Format");

    if (!buyerUuid) throw new Error("Invalid Buyer Uuid");

    if (!cardHolderName) throw new Error("Invalid Card Holder Name");

    if (!dateValidator(cardExpiryDate)) throw new Error("Invalid date format");

    if (/\D/g.test(cardCVV) || cardCVV.length > 4 || cardCVV.length < 3)
      throw new Error("Invalid Card CVV");

    const iframe = await Iframe.createIframe();

    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        window.removeEventListener("message", listener);

        if (!message.data.error) {
          const messageData = message.data;

          // TODO: Mapear outros cenários de erros possíveis aqui
          if (Array.isArray(messageData.errors) && messageData.errors.length)
            reject(messageData);

          resolve(messageData);
        }
        reject(message.data);
        Iframe.getIFrame().remove();
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
        "https://sdk-client.barte.com/script.min.js"
      );
    });
  }
}
