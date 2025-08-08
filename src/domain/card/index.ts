import type { CardTokenData, TokenizeResult } from "./types";
import { Iframe } from "../iframe/index";
import { dateValidator, luhnValidator } from "./utils";
import { WebConstructor } from "../web-constructor";

export class BarteCard extends WebConstructor {
  constructor(accessToken: string) {
    super(accessToken);
  }

  public async cardToken({
    cardHolderName,
    cardCVV,
    cardExpiryDate,
    cardNumber,
    buyerUuid,
  }: CardTokenData): Promise<TokenizeResult> {
    if (cardNumber.length < 16) throw new Error("Número de cartão inválido!");

    if (!luhnValidator(cardNumber))
      throw new Error("Formato do número do cartão é inválido!");

    if (!buyerUuid) throw new Error("O uuid do buyer é obrigatório");

    if (!cardHolderName) throw new Error("O nome do cartão é obrigatório");

    if (!dateValidator(cardExpiryDate))
      throw new Error("Formato de data inválido");

    if (/\D/g.test(cardCVV) || cardCVV.length > 4 || cardCVV.length < 3)
      throw new Error("Formato de CVV inválido");

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
