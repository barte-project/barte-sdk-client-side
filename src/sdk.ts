// TODO: Create an enum for errors
import { BarteCardToken } from "./domain/payment/card/token";
import type { BarteSDKConstructorProps } from "./types";

export class BarteSDK {
  private cardTokenContext: BarteCardToken;

  private constructor({
    accessToken,
    tokenizeResultCallback,
  }: BarteSDKConstructorProps) {
    if (!window)
      throw new Error(
        "O objeto 'window' não está presente! O SDK Barte deve ser usado somente no contexto do Browser!"
      );

    if (!accessToken) throw new Error("Access Token é obrigatório!");

    if (!tokenizeResultCallback || typeof tokenizeResultCallback !== "function")
      throw new Error(
        "Função de callback para resultado de tokenização é obrigatória"
      );
  }

  static async init(props: BarteSDKConstructorProps) {
    // validar accessToken aqui via backend
    const sdk = new BarteSDK(props);
    sdk.cardTokenContext = await BarteCardToken.init({
      accessToken: props.accessToken,
      tokenizeResultCallback: props.tokenizeResultCallback,
    });
    return sdk;
  }

  public get payment() {
    return {
      card: {
        token: {
          create: this.cardTokenContext.cardToken,
        },
      },
    };
  }
}

(window as any).BarteSDK = BarteSDK;
