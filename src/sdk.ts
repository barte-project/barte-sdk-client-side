import { FingerPrint } from "./fingerprint";
import { HTMLHandler } from "./html_handler";
import type {
  AccessTokenPayload,
  BarteSDKConstructorProps,
  CardTokenData,
  TokenizeResult,
} from "./types";

class SDKUtils {
  public static decodeJwtPayload(token: string) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Access Token inválido");
    }

    const payloadBase64 = parts[1];

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const obj = JSON.parse(jsonPayload) as AccessTokenPayload;

    if (!obj.antifraudService || !obj.sellerId || isNaN(obj.sellerId))
      throw new Error("Access Token inválido");

    return obj;
  }

  public static dateValidator(value: string) {
    const expirationDateRegex = /^(0[1-9]|1[0-2])\/(\d{4})$/;

    if (!expirationDateRegex.test(value)) return false;

    if (Number(value.substring(3, 7)) < new Date().getFullYear()) return false;

    if (Number(value.substring(0, 2)) < new Date().getMonth() + 1) return false;

    return true;
  }

  public static luhnValidator(number: string) {
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

export class BarteSDK {
  private accessToken: string;
  private fingerPrint: FingerPrint;
  private htmlHandler: HTMLHandler;

  constructor({ accessToken }: BarteSDKConstructorProps) {
    if (!window)
      throw new Error(
        "O objeto 'window' não está presente! O SDK Barte deve ser usado somente no contexto do Browser!"
      );

    if (!accessToken) throw new Error("Access Token é obrigatório!");

    const { antifraudService } = SDKUtils.decodeJwtPayload(accessToken);

    this.accessToken = accessToken;

    this.fingerPrint = new FingerPrint();
    this.htmlHandler = new HTMLHandler(
      antifraudService === "NETHONE" || antifraudService === "BARTE"
        ? { antifraudService }
        : { antifraudService, buyerUuid: "" }
    );
  }

  public async cardToken({
    cardHolderName,
    cardCVV,
    cardExpiryDate,
    cardNumber,
    buyerUuid,
  }: CardTokenData): Promise<TokenizeResult> {
    if (cardNumber.length < 16) throw new Error("Número de cartão inválido!");

    if (!SDKUtils.luhnValidator(cardNumber))
      throw new Error("Formato do número do cartão é inválido!");

    if (!buyerUuid) throw new Error("O uuid do buyer é obrigatório");

    if (!cardHolderName) throw new Error("O nome do cartão é obrigatório");

    if (!SDKUtils.dateValidator(cardExpiryDate))
      throw new Error("Formato de data inválido");

    if (/\D/g.test(cardCVV) || cardCVV.length > 4 || cardCVV.length < 3)
      throw new Error("Formato de CVV inválido");

    const iframe = await this.htmlHandler.createIframe();

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
        this.htmlHandler.getIFrame().remove();
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

  public async getFingerPrint() {
    return this.fingerPrint.fingerPrint();
  }
}

(window as any).BarteSDK = BarteSDK;
