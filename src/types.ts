import { EnvironmentType } from "./config/env";
import {
  PaymentOrderData,
  SessionData,
} from "./domain/payment/checkout/wallet/types";

export type BarteSDKConstructorProps = {
  accessToken: string;
  environment?: EnvironmentType;
};

export type EventConfigProps = {
  accessToken: string;
  environment: EnvironmentType;
};

type EventType =
  | "submitTokenForm"
  | "submitCreateBuyer"
  | "submitCreateSession"
  | "submitCreatePayment";

export type EventData = (
  | {
      type: "submitTokenForm";
      data: {
        holderName: string;
        cvv: string;
        expiration: string;
        number: string;
        buyerUuid: string;
      };
    }
  | { type: "submitCreateBuyer"; data: { buyerId: string } }
  | { type: "submitCreateSession"; data: SessionData }
  | { type: "submitCreatePayment"; data: PaymentOrderData }
) & {
  config: EventConfigProps;
};

export type CreateSessionResultType = {
  checkoutSession: string;
};
