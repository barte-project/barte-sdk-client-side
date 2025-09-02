import type { BarteSDKConstructorProps } from "../types";
import { Fingerprint } from "./antifraud/fingerprint";
// import { BarteWallet } from "./payment/checkout/wallet";
import { CardToken } from "./payment/token/index";
import { WebConstructor } from "./web-constructor";

export default class Barte extends WebConstructor {
  private cardContext: CardToken | null = null;
  private fingerprintContext: Fingerprint | null = null;
  // private walletContext: BarteWallet | null = null;

  constructor({
    accessToken,
    environment = "production",
  }: BarteSDKConstructorProps) {
    super({ accessToken, environment });
  }

  private getCardInstance() {
    const instance =
      this.cardContext ??
      new CardToken({
        accessToken: this.accessToken,
        environment: this.environment,
      });
    if (!this.cardContext) this.cardContext = instance;
    return instance;
  }

  private getFingerprintInstance() {
    const instance =
      this.fingerprintContext ??
      new Fingerprint({
        accessToken: this.accessToken,
        environment: this.environment,
      });

    if (!this.fingerprintContext) this.fingerprintContext = instance;

    return instance;
  }

  // private getBarteWallet() {
  //   const instance =
  //     this.walletContext ??
  //     new BarteWallet({
  //       accessToken: this.accessToken,
  //       environment: this.environment,
  //     });
  //   if (!this.walletContext) this.walletContext = instance;
  //   return instance;
  // }

  public get payment() {
    return {
      card: {
        token: this.getCardInstance(),
      },
      // checkout: {
      //   wallet: this.getBarteWallet(),
      // },
    };
  }

  public get antifraud() {
    return {
      fingerprint: this.getFingerprintInstance(),
    };
  }
}

export { Barte };

(window as any).Barte = Barte;
