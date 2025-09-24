import { BarteSDKConstructorProps } from "../../../types";
import { dispatchScriptMessage } from "../../message/dispatchMessage";
import { validateOriginAndEventName } from "../../message/utils";
import { WebConstructor } from "../../web-constructor";
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

    await dispatchScriptMessage({
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
    });

    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        if (!validateOriginAndEventName(message, "submitTokenForm")) return;

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
    });
  }
}
