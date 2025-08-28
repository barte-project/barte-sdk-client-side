type EnvironmentVariables = "iframeUrl" | "iframeScriptUrl" | "apiUrl";
export type EnvironmentType = "production" | "sandbox" | "dev";

export const ENV: Record<
  EnvironmentType,
  Record<EnvironmentVariables, string>
> = {
  dev: {
    apiUrl: "https://dev-bff.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://dev-sdk-client.barte.com/script.min.js", // change
    iframeUrl: "https://dev-sdk-client.barte.com", // change
  },
  production: {
    apiUrl: "",
    iframeScriptUrl: "https://sdk-client.barte.com/script.min.js",
    iframeUrl: "https://sdk-client.barte.com",
  },
  sandbox: {
    apiUrl: "https://sandbox-bff.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://sandbox-sdk-client.barte.com/script.min.js",
    iframeUrl: "https://sandbox-sdk-client.barte.com",
  },
};

export class Environment {
  private static intance: Environment | null = null;
  private currentEnv: EnvironmentType;

  private constructor(currentEnv: EnvironmentType) {
    this.currentEnv = currentEnv;
  }

  public static getInstance(currentEnv: EnvironmentType): Environment {
    if (!Environment.intance) {
      Environment.intance = new Environment(currentEnv);
    }
    return Environment.intance;
  }

  public get getEnv() {
    return ENV[this.currentEnv];
  }
}
