import type { BarteSDKConstructorProps } from "../types";
import { BarteFingerprint } from "./antifraud/fingerprint";
import { BarteWallet } from "./payment/checkout";
import { BarteToken } from "./payment/token/index";
import { WebConstructor } from "./web-constructor";

export class BarteSDK extends WebConstructor {
  private cardContext: BarteToken | null = null;
  private fingerprintContext: BarteFingerprint | null = null;
  private walletContext: BarteWallet | null = null;

  constructor({ accessToken }: BarteSDKConstructorProps) {
    super(accessToken);
  }

  private getCardInstance() {
    const instance = this.cardContext ?? new BarteToken(this.accessToken);
    if (!this.cardContext) this.cardContext = instance;
    return instance;
  }

  private getFingerprintInstance() {
    const instance =
      this.fingerprintContext ?? new BarteFingerprint(this.accessToken);

    if (!this.fingerprintContext) this.fingerprintContext = instance;

    return instance;
  }

  private getBarteWallet() {
    const instance = this.walletContext ?? new BarteWallet(this.accessToken);
    if (!this.walletContext) this.walletContext = instance;
    return instance;
  }

  public get payment() {
    return {
      card: this.getCardInstance(),
      checkout: this.getBarteWallet(),
    };
  }

  public get antifraud() {
    return {
      fingerprint: this.getFingerprintInstance(),
    };
  }

}

(window as any).BarteSDK = BarteSDK;
