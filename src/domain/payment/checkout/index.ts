import { WebConstructor } from "../../web-constructor";
import { loadScript } from "@yuno-payments/sdk-web";
import ApiClient from "./api";
import { YunoInstance } from "@yuno-payments/sdk-web-types";
import { BarteErrorProps, BarteSDKConstructorProps } from "../../../types";
import { EnvironmentType, getEnv } from "../../../config/env";

interface Amount {
  currency: "BRL" | string;
  value: number;
}
interface PaymentOptions {
  element: string; // Ex: "#root"
  country?: string;
  language?: "pt" | "en" | "es"; 
  buyerId: string;
  amount: Amount;
  method: "GOOGLE_PAY" | "APPLE_PAY"; 
  paymentDescription?: string;
  //Payment Order Props
  startDate: string; // Ex: yyyy-MM-dd
  internationalDocument: {
    documentNumber: string;
    documentType: string; // Ex: CPF
    documentNation: string; // Ex: BR
  };
  name: string;
  email: string;
  phone: string;
  billingAddress: {
    country: string,
    state: string,
    city: string,
    district: string,
    street: string,
    zipCode: string,
  }
}
type YunoEnvironmentOptions = "dev" | "prod" | "sandbox" | "staging";

export class BarteWallet extends WebConstructor {
  private apiClient: ApiClient;
  private yuno?: YunoInstance;
  constructor({ accessToken, environment }: BarteSDKConstructorProps) {
    super({ accessToken, environment });
    this.apiClient = new ApiClient({accessToken, environment});
  }
  private formatEnvironment(environment: EnvironmentType) {
    const formattedEnvironment = {
      local: "dev",
      dev: "staging",
      production: "prod",
      sandbox: "sandbox",
    }
    return formattedEnvironment[environment] as YunoEnvironmentOptions;
  }
  private parseAmountValue(v: number | string): number {
    if (typeof v === "number") return v;
    return Number(String(v).replace(/\./g, "").replace(",", "."));
  }
  private isBarteDuplicatedCustomerError(err: BarteErrorProps): boolean {
    return err?.response?.data?.errors?.[0]?.code === "BAR-1801";
  }
  private async ensureYunoInitialized(publicKey: string): Promise<YunoInstance> {
    if (this.yuno) return this.yuno; 
    const { initialize }  = await loadScript({ env: this.formatEnvironment(this.environment) });
    this.yuno = await initialize(publicKey); 
    return this.yuno;
  }

  private buildPaymentPayload(
    data: PaymentOptions,
    oneTimeToken: string,
    uuidSession: string,
    uuidIntegration: string
  ) {
    return {
      startDate: data.startDate,
      value: this.parseAmountValue(data.amount.value),
      installments: 1,
      title: data.paymentDescription || "Wallet Order",
      payment: {
        method: data.method,
        wallet: {
          oneTimeToken,
          checkoutSessionUuid: uuidSession,
          integrationOrderId: uuidIntegration,
        },
        fraudData: {
          internationalDocument: {
            documentNumber: data.internationalDocument.documentNumber,
            documentType: data.internationalDocument.documentType,
            documentNation: data.internationalDocument.documentNation,
          },
          name: data.name,
          email: data.email,
          phone: data.phone,
          billingAddress: {
            country: data.billingAddress.country,
            state: data.billingAddress.state,
            city: data.billingAddress.city,
            district: data.billingAddress.district,
            street: data.billingAddress.street,
            zipCode: data.billingAddress.zipCode,
          },
        },
      },
      metadata: [{ key: "Version", value: "1" }],
      uuidBuyer: data.buyerId,
    };
  }

  public async start(data: PaymentOptions): Promise<void> {
    const yuno = await this.ensureYunoInitialized(getEnv(this.environment).yunoKey);
    const merchantId = crypto.randomUUID();
    try {
      await this.apiClient.createBuyerYuno(data.buyerId);
    } catch (err) {
      const error = err as BarteErrorProps;
      if (!this.isBarteDuplicatedCustomerError(error)) throw error;
    }
    const sessionData = await this.apiClient.createSession({
      country: data.country ?? "BR",
      amount: {
        currency: data.amount?.currency ?? "BRL",
        value: this.parseAmountValue(data.amount.value),
      },
      uuidBuyer: data.buyerId,
      merchantOrderId: merchantId,
      paymentDescription: data.paymentDescription || "",
    });
    const uuidSession = sessionData.checkoutSession;
    const uuidIntegration = merchantId;
    yuno.startCheckout({
      checkoutSession: uuidSession,
      elementSelector: data.element,
      countryCode: data.country ?? "BR",
      language: data.language ?? "pt",
      showLoading: true,
      showPaymentStatus: true,
      issuersFormEnable: true,
      renderMode: { type: "element", elementSelector: data.element },
      card: { type: "extends", cardSaveEnable: true },
      onLoading: (args) => console.log(args),
      yunoCreatePayment: async (oneTimeToken: string) => {
        try {
          const body = this.buildPaymentPayload(
            data,
            oneTimeToken,
            uuidSession,
            uuidIntegration
          );
          await this.apiClient.createPaymentOrder(body);
          await yuno.continuePayment({ 
            showPaymentStatus: true 
          });
        } catch (err) {
          console.error("Erro ao criar pagamento:", err);
          yuno.hideLoader();
        }
      },
      yunoPaymentResult: async (result: unknown) => {
        console.log("yunoPaymentResult", result);
        window.location.reload();
      },
      yunoError: (error) => {
        console.error("Erro no Yuno:", error);
        yuno.hideLoader();
      },
    });
    yuno.mountCheckoutLite({
      paymentMethodType: data.method
    });
  }
}
