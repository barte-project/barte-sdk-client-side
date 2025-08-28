import {
  BarteSDKConstructorProps,
  CardTokenData,
  TokenizeResult,
  TokenizeResultCallback,
} from "../../../../types";
import { createIframe, dateValidator, luhnValidator } from "../../../../utils";

export class BarteCardToken {
  private iframe: HTMLIFrameElement;
  private accessToken: string;
  private static instance: BarteCardToken | null = null;
  private tokenizeResultCallback: TokenizeResultCallback;

  private constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  public static async init({
    accessToken,
    tokenizeResultCallback,
  }: BarteSDKConstructorProps): Promise<BarteCardToken> {
    if (!this.instance) {
      // validar o tipo das variáveis
      const instance = new BarteCardToken(accessToken);
      instance.iframe = await createIframe();
      instance.tokenizeResultCallback = tokenizeResultCallback;
      this.instance = instance;
    }
    return this.instance;
  }

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

    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        window.removeEventListener("message", listener);

        if (!message.data.error) {
          const messageData = message.data;

          // TODO: Mapear outros cenários de erros possíveis aqui
          if (Array.isArray(messageData.errors) && messageData.errors.length)
            reject(messageData);

          // TODO: checar aqui, pois todos os campos estão sendo repassados, não só o card token
          BarteCardToken.instance?.tokenizeResultCallback(messageData);
          resolve(messageData);
        }
        reject(message.data);
      };

      window.addEventListener("message", listener);

      BarteCardToken.instance?.iframe.contentWindow?.postMessage(
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
        "http://localhost:5500/dist/script.min.js"
      );
    });
  }
}
