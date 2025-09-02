import type { BarteSDKConstructorProps } from "../types";
import { BarteFingerprint } from "./antifraud/fingerprint";
import { BarteWallet } from "./payment/checkout/wallet";
import { BarteToken } from "./payment/token/index";
import { WebConstructor } from "./web-constructor";

export class BarteSDK extends WebConstructor {
  private cardContext: BarteToken | null = null;
  private fingerprintContext: BarteFingerprint | null = null;
  private walletContext: BarteWallet | null = null;

  constructor({
    accessToken,
    environment = "production",
  }: BarteSDKConstructorProps) {
    super({ accessToken, environment });
  }

  private getCardInstance() {
    const instance =
      this.cardContext ??
      new BarteToken({
        accessToken: this.accessToken,
        environment: this.environment,
      });
    if (!this.cardContext) this.cardContext = instance;
    return instance;
  }

  private getFingerprintInstance() {
    const instance =
      this.fingerprintContext ??
      new BarteFingerprint({
        accessToken: this.accessToken,
        environment: this.environment,
      });

    if (!this.fingerprintContext) this.fingerprintContext = instance;

    return instance;
  }

  private getBarteWallet() {
    const instance =
      this.walletContext ??
      new BarteWallet({
        accessToken: this.accessToken,
        environment: this.environment,
      });
    if (!this.walletContext) this.walletContext = instance;
    return instance;
  }

  public get payment() {
    return {
      card: {
        token: this.getCardInstance(),
      },
      checkout: {
        wallet: this.getBarteWallet(),
      },
    };
  }

  public get antifraud() {
    return {
      fingerprint: this.getFingerprintInstance(),
    };
  }
}

(window as any).BarteSDK = BarteSDK;
