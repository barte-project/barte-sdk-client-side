import { Card } from "./domain/card/index";
import { CardTokenData, TokenizeResult } from "./domain/card/types";
import type { BarteSDKConstructorProps } from "./types";

export class BarteSDK {
  private cardContext: Card;

  constructor({ accessToken }: BarteSDKConstructorProps) {
    if (!window)
      throw new Error(
        "Window is not defined, Barte SDK must be used in frontend context!"
      );

    if (!accessToken) throw new Error("Access Token is required!");

    this.cardContext = new Card(accessToken);
  }

  public async cardToken(data: CardTokenData): Promise<TokenizeResult> {
    return this.cardContext.cardToken(data);
  }
}

(window as any).BarteSDK = BarteSDK;
