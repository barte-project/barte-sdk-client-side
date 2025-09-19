import { BarteSDKConstructorProps } from "../../../types";
import { WebConstructor } from "../../web-constructor";
import { createIframe } from "./iframe";
import type { CardTokenData, TokenizeResult } from "./types";
import { dateValidator, luhnValidator } from "./utils";

export class CardToken extends WebConstructor {
  constructor({ accessToken, environment }: BarteSDKConstructorProps) {
    super({ accessToken, environment });
  }

  public async create({
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
      throw new Error("Data de validade expirada!");

    if (/\D/g.test(cardCVV) || cardCVV.length > 4 || cardCVV.length < 3)
      throw new Error("Formato de CVV inválido");

    const iframe = await createIframe();

    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        // if (message.origin !== Env.SDK_IFRAME_URL) return;

        window.removeEventListener("message", listener);

        if (!message.data.error) {
          const messageData = message.data;

          // TODO: Mapear outros cenários de erros possíveis aqui
          if (Array.isArray(messageData.errors) && messageData.errors.length)
            reject(messageData);

          resolve(messageData);
        }
        reject(message.data);
      };

      window.addEventListener("message", listener);

      iframe.contentWindow?.postMessage(
        {
          type: "submitTokenForm",
          data: {
            holderName: cardHolderName.trim(),
            cvv: cardCVV,
            expiration: cardExpiryDate,
            number: cardNumber,
            buyerUuid,
          },
          config: {
            accessToken: this.accessToken,
            environment: this.environment,
          },
        },
        Env.SDK_IFRAME_URL
      );
    });
  }
}
