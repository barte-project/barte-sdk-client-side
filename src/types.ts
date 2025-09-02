import { EnvironmentType } from "./config/env";

export type BarteSDKConstructorProps = {
  accessToken: string;
  environment?: EnvironmentType;
};

export type BarteErrorProps = {
  errors?: Array<{
    code: string;
    title?: string;
    description?: string;
    additionalInfo?: {
      type?: string;
      declinedCode?: string;
      customMessage?: string;
    };
  }>;
  message?: string;
  stack?: string;
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

export type EventData = {
  type: "submitTokenForm";
  data: {
    holderName: string;
    cvv: string;
    expiration: string;
    number: string;
    buyerUuid: string;
  };
} & {
  config: EventConfigProps;
};
