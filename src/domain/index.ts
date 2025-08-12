import type { BarteSDKConstructorProps } from "../types";
import { BarteFingerprint } from "./antifraud/fingerprint";
import { BarteCard } from "./card/index";
import { WebConstructor } from "./web-constructor";

export class BarteSDK extends WebConstructor {
  private cardContext: BarteCard | null = null;
  private fingerprintContext: BarteFingerprint | null = null;

  constructor({ accessToken }: BarteSDKConstructorProps) {
    super(accessToken);
  }

  private getCardInstance() {
    const instance = this.cardContext ?? new BarteCard(this.accessToken);
    if (!this.cardContext) this.cardContext = instance;
    return instance;
  }

  private getFingerprintInstance() {
    const instance =
      this.fingerprintContext ?? new BarteFingerprint(this.accessToken);

    if (!this.fingerprintContext) this.fingerprintContext = instance;

    return instance;
  }

  public get payment() {
    return {
      card: this.getCardInstance(),
    };
  }

  public get antifraud() {
    return {
      fingerprint: this.getFingerprintInstance(),
    };
  }
}

(window as any).BarteSDK = BarteSDK;
