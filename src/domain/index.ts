import type { BarteSDKConstructorProps } from "../types";
import { BarteCard } from "./card/index";
import { CardTokenData, TokenizeResult } from "./card/types";
import { WebConstructor } from "./web-constructor";

export class BarteSDK extends WebConstructor {
  private cardContext: BarteCard;

  constructor({ accessToken }: BarteSDKConstructorProps) {
    super(accessToken);

    this.cardContext = new BarteCard(accessToken);
  }

  public get card() {
    return {
      cardToken: this.cardContext.cardToken,
    };
  }
}

(window as any).BarteSDK = BarteSDK;
