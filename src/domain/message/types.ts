import { EnvironmentType } from "../../config/env";

export type EventConfigProps = {
  accessToken: string;
  environment: EnvironmentType;
};

export const EventTypeData = [
  "submitTokenForm",
  "submitCreateBuyer",
  "submitCreateSession",
  "submitCreatePayment",
] as const;

export type EventType = (typeof EventTypeData)[number];

export type EventDataRequest = (
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
  | {
      type: EventType;
      data: any;
    }
) & {
  config: EventConfigProps;
};

export type EventDataResponse = {
  type: EventType;
  data?: any;
};
