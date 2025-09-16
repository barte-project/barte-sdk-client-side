type EnvironmentVariables = "apiUrl" | "yunoKey" | "monolictUrl" | "paymentUrl";

const EnvironmentList = ["production", "sandbox", "dev", "local"] as const;
export type EnvironmentType = (typeof EnvironmentList)[number];

const ENV: Record<EnvironmentType, Record<EnvironmentVariables, string>> = {
  dev: {
    monolictUrl: "https://dev-bff.barte.com/",
    paymentUrl: "https://dev-bff.barte.com/service/payment/",
    apiUrl: "https://dev-bff.barte.com/service/payment/v1/sdk/card-tokens",
    yunoKey:
      "sandbox_gAAAAABm7ZDFYguOYAtxMqHVOXMyDDP_Wxk-Uq3LgOM6EYTJqeYXXb-oCx47lchu-tRCAZ5i2FNq6SdmHxlLhPUK3FvhRQ3EfKBPhKdjheVOLwUeofvuTl1oma_fiuYskVPIJ1YgtmzhkejIa73XpS7tP0uCl8yDLDF2Sf9zFd5xIYWjLakvRXL3f4Ai1j4_rBYbIOlTXvKucRpJuxAuJsdZQAfNAF5v1ffhogP_Ul8phRQAaL-Pe8eBLXcridZg9gKoGCNV3638",
  },
  sandbox: {
    monolictUrl: "https://sandbox-bff.barte.com/service/core/",
    paymentUrl: "https://sandbox-bff.barte.com/service/payment/",
    apiUrl: "https://sandbox-bff.barte.com/service/payment/v1/sdk/card-tokens",
    yunoKey:
      "sandbox_gAAAAABm7ZDFYguOYAtxMqHVOXMyDDP_Wxk-Uq3LgOM6EYTJqeYXXb-oCx47lchu-tRCAZ5i2FNq6SdmHxlLhPUK3FvhRQ3EfKBPhKdjheVOLwUeofvuTl1oma_fiuYskVPIJ1YgtmzhkejIa73XpS7tP0uCl8yDLDF2Sf9zFd5xIYWjLakvRXL3f4Ai1j4_rBYbIOlTXvKucRpJuxAuJsdZQAfNAF5v1ffhogP_Ul8phRQAaL-Pe8eBLXcridZg9gKoGCNV3638",
  },
  production: {
    monolictUrl: "https://bff.barte.com/service/core/",
    paymentUrl: "https://bff.pcip.barte.com/service/payment/",
    apiUrl: "https://bff.pcip.barte.com/service/payment/v1/sdk/card-tokens",
    yunoKey:
      "prod_gAAAAABm7ZDEbdCd5AsQHf0I8wm-rAz_pdIzrr7OvuGA298kQHBdCpIUZRW1NPEIzXi_uSC6apXO7dHptkv41heS0jmE94_mfsKi6v6JFQbQAcsnZITRxa1cBO6JhOvuWAj6qIopfgK_MB_5HTbpuhTbRu423YSutvtcrqJumFJeeIRcy89__G7NrJ3Td2fbkEH8rjbblVBxwT4ax14RiuFbvDLGFRAWhbSi23Zw_Wto2D8WhFUTdVwg-T215N10erG5Y0Uq5fRQ",
  },
  local: {
    monolictUrl: "http://localhost:8080",
    paymentUrl: "https://sandbox-bff.barte.com/service/payment/",
    apiUrl: "https://sandbox-bff.barte.com/service/payment/v1/sdk/card-tokens",
    yunoKey:
      "sandbox_gAAAAABm7ZDFYguOYAtxMqHVOXMyDDP_Wxk-Uq3LgOM6EYTJqeYXXb-oCx47lchu-tRCAZ5i2FNq6SdmHxlLhPUK3FvhRQ3EfKBPhKdjheVOLwUeofvuTl1oma_fiuYskVPIJ1YgtmzhkejIa73XpS7tP0uCl8yDLDF2Sf9zFd5xIYWjLakvRXL3f4Ai1j4_rBYbIOlTXvKucRpJuxAuJsdZQAfNAF5v1ffhogP_Ul8phRQAaL-Pe8eBLXcridZg9gKoGCNV3638",
  },
};

export const validateEnvironment = (env: EnvironmentType) =>
  EnvironmentList.includes(env);

export function getEnv(currentEnv: EnvironmentType) {
  if (!validateEnvironment(currentEnv))
    throw new Error(
      `O ambiente '${currentEnv}' não é um ambiente válido para o SDK!`
    );
  return ENV[currentEnv];
}
