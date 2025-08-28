import { EnvironmentType } from "./config/env";

export type BarteSDKConstructorProps = {
  accessToken: string;
  environment?: EnvironmentType;
};
