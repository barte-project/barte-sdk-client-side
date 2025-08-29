type EnvironmentVariables = "iframeUrl" | "iframeScriptUrl" | "apiUrl";

const EnvironmentList = ["production", "sandbox", "dev", "local"] as const;
export type EnvironmentType = (typeof EnvironmentList)[number];

const ENV: Record<EnvironmentType, Record<EnvironmentVariables, string>> = {
  dev: {
    apiUrl: "https://dev-bff.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://dev-sdk-client.barte.com/script.min.js",
    iframeUrl: "https://dev-sdk-client.barte.com/",
  },
  sandbox: {
    apiUrl: "https://sandbox-bff.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://dev-sdk-client.barte.com/script.min.js",
    iframeUrl: "https://dev-sdk-client.barte.com/",
  },
  production: {
    apiUrl: "https://bff.pcip.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://dev-sdk-client.barte.com/script.min.js",
    iframeUrl: "https://dev-sdk-client.barte.com/",
  },
  local: {
    apiUrl: "https://sandbox-bff.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "http://localhost:5500/dist/script.min.js",
    iframeUrl: "http://localhost:5500/dist/index.html",
  },
};

export function validateInstance(env: EnvironmentType) {
  return EnvironmentList.includes(env);
}

export function getEnv(currentEnv: EnvironmentType) {
  if (!validateInstance(currentEnv))
    throw new Error(
      `O ambiente '${currentEnv}' não é um ambiente válido para o SDK!`
    );
  return ENV[currentEnv];
}
