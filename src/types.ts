import { EnvironmentType } from "./config/env";

export type BarteSDKConstructorProps = {
  accessToken: string;
  environment?: EnvironmentType;
};

export type BarteErrorProps =  {
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
}
