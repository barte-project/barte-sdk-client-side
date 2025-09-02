import { EnvironmentType, validateEnvironment } from "../config/env";
import { BarteSDKConstructorProps } from "../types";

export abstract class WebConstructor {
  protected accessToken: string;
  protected environment: EnvironmentType;

  constructor({ accessToken, environment }: BarteSDKConstructorProps) {
    if (typeof window === "undefined")
      throw new Error(
        "O objeto 'window' não está presente! O SDK Barte deve ser usado somente no contexto do Browser!"
      );

    if (!accessToken) throw new Error("Access Token é obrigatório!");

    validateEnvironment(environment ?? "production");

    this.accessToken = accessToken;
    this.environment = environment ?? "production";
  }
}
