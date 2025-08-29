type EnvironmentVariables = "iframeUrl" | "iframeScriptUrl" | "apiUrl" | "yunoKey";

const EnvironmentList = ["production", "sandbox", "dev"] as const;
export type EnvironmentType = (typeof EnvironmentList)[number];

export const ENV: Record<
  EnvironmentType,
  Record<EnvironmentVariables, string>
> = {
  dev: {
    apiUrl: "https://dev-bff.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://dev-sdk-client.barte.com/script.min.js", // change
    iframeUrl: "https://dev-sdk-client.barte.com/", // change
    yunoKey: "sandbox_gAAAAABm7ZDFYguOYAtxMqHVOXMyDDP_Wxk-Uq3LgOM6EYTJqeYXXb-oCx47lchu-tRCAZ5i2FNq6SdmHxlLhPUK3FvhRQ3EfKBPhKdjheVOLwUeofvuTl1oma_fiuYskVPIJ1YgtmzhkejIa73XpS7tP0uCl8yDLDF2Sf9zFd5xIYWjLakvRXL3f4Ai1j4_rBYbIOlTXvKucRpJuxAuJsdZQAfNAF5v1ffhogP_Ul8phRQAaL-Pe8eBLXcridZg9gKoGCNV3638",
  },
  sandbox: {
    apiUrl: "https://sandbox-bff.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://dev-sdk-client.barte.com/script.min.js",
    iframeUrl: "https://dev-sdk-client.barte.com/",
    yunoKey: "sandbox_gAAAAABm7ZDFYguOYAtxMqHVOXMyDDP_Wxk-Uq3LgOM6EYTJqeYXXb-oCx47lchu-tRCAZ5i2FNq6SdmHxlLhPUK3FvhRQ3EfKBPhKdjheVOLwUeofvuTl1oma_fiuYskVPIJ1YgtmzhkejIa73XpS7tP0uCl8yDLDF2Sf9zFd5xIYWjLakvRXL3f4Ai1j4_rBYbIOlTXvKucRpJuxAuJsdZQAfNAF5v1ffhogP_Ul8phRQAaL-Pe8eBLXcridZg9gKoGCNV3638",
  },
  production: {
    apiUrl: "https://bff.pcip.barte.com/service/payment/v1/sdk/card-tokens",
    iframeScriptUrl: "https://dev-sdk-client.barte.com/script.min.js",
    iframeUrl: "https://dev-sdk-client.barte.com/",
    yunoKey: "prod_gAAAAABm7ZDEbdCd5AsQHf0I8wm-rAz_pdIzrr7OvuGA298kQHBdCpIUZRW1NPEIzXi_uSC6apXO7dHptkv41heS0jmE94_mfsKi6v6JFQbQAcsnZITRxa1cBO6JhOvuWAj6qIopfgK_MB_5HTbpuhTbRu423YSutvtcrqJumFJeeIRcy89__G7NrJ3Td2fbkEH8rjbblVBxwT4ax14RiuFbvDLGFRAWhbSi23Zw_Wto2D8WhFUTdVwg-T215N10erG5Y0Uq5fRQ",
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
