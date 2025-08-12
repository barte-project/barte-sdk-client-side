import type { BarteSDKConstructorProps } from "../types";
import { BarteCard } from "./card/index";
import { WebConstructor } from "./web-constructor";

export class BarteSDK extends WebConstructor {
  private cardContext: BarteCard | undefined;

  constructor({ accessToken }: BarteSDKConstructorProps) {
    super(accessToken);
  }

  private getCardInstance() {
    const instance = this.cardContext ?? new BarteCard(this.accessToken);
    if (!this.cardContext) this.cardContext = instance;
    return instance;
  }

  public get payment() {
    return {
      card: this.getCardInstance(),
    };
  }
}

(window as any).BarteSDK = BarteSDK;
