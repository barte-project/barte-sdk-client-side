import { WebConstructor } from "../../web-constructor";
import { loadScript } from "@yuno-payments/sdk-web";
import ApiClient from "./api";
import { YunoInstance } from "@yuno-payments/sdk-web-types";
import { BarteErrorProps, BarteSDKConstructorProps } from "../../../types";
import { getEnv } from "../../../config/env";
// import { isBarteDuplicatedCustomerError } from "../../../utils";

interface Amount {
  currency: "BRL" | string;
  value: number;
}
interface StartOptions {
  element: string; // Ex: "#root"
  country?: string; // default "BR"
  language?: "pt" | "en" | "es"; 
  buyerId: string;
  amount: Amount;
  method: string;
  paymentDescription?: string;
  apiToken: string;
}
export class BarteWallet extends WebConstructor {
  private apiClient: ApiClient;
  private yuno?: YunoInstance;
  constructor({ accessToken, environment }: BarteSDKConstructorProps) {
    super({ accessToken, environment });
    this.apiClient = new ApiClient(accessToken);
  }
  private actualDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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
    const { initialize }  = await loadScript({ env: getEnv(this.environment) });
    this.yuno = await initialize(publicKey); 
    return this.yuno;
  }

  private buildPaymentPayload(
    opts: StartOptions,
    oneTimeToken: string,
    uuidSession: string,
    uuidIntegration: string
  ) {
    return {
      startDate: this.actualDate(),
      value: this.parseAmountValue(opts.amount.value),
      installments: 1,
      title: opts.paymentDescription || "Order",
      payment: {
        method: opts.method,
        wallet: {
          oneTimeToken,
          checkoutSessionUuid: uuidSession,
          integrationOrderId: uuidIntegration,
        },
        fraudData: {
          internationalDocument: {
            documentNumber: "65606587084",
            documentType: "CPF",
            documentNation: "BR",
          },
          name: `Wallet ${opts.amount.value}`,
          email: `wallet_${opts.amount.value}@email.com`,
          phone: "34992991234",
          billingAddress: {
            country: "BR",
            state: "MG",
            city: "Uberlandia",
            district: "Centro",
            street: "Rua Teste",
            zipCode: "38401999",
          },
        },
      },
      metadata: [{ key: "Version", value: "1" }],
      uuidBuyer: opts.buyerId,
    };
  }

  private async createPaymentOrder(
    opts: StartOptions,
    oneTimeToken: string,
    uuidSession: string,
    uuidIntegration: string
  ) {
    const url = "https://sandbox-bff.barte.com/service/payment/v1/orders";
    const headers = {
      "X-Token-Api": opts.apiToken,
      "Content-Type": "application/json",
      "x-idempotency-key": crypto.randomUUID(),
    };
    const body = this.buildPaymentPayload(
      opts,
      oneTimeToken,
      uuidSession,
      uuidIntegration
    );
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao criar order: ${res.status} ${text}`);
    }
    return res.json();
  }

  public async start(opts: StartOptions): Promise<void> {
    const yuno = await this.ensureYunoInitialized(getEnv(this.environment).yunoKey);
    console.log("oi", yuno)
    const merchantId = crypto.randomUUID();
    try {
      //buyer uuid sandbox - "integrationCustomerId": "d1221e91-475b-4408-a209-6231b76797ed"
      await this.apiClient.createBuyerYuno(opts.buyerId);
    } catch (err) {
      const error = err as BarteErrorProps;
      if (!this.isBarteDuplicatedCustomerError(error)) throw error;
    }
    // try {
    //   const sessionData = await this.apiClient.createSession({
    //     country: opts.country ?? "BR",
    //     amount: {
    //       currency: opts?.amount?.currency ?? "BRL",
    //       value: this.parseAmountValue(opts.amount.value),
    //     },
    //     uuidBuyer: opts.buyerId,
    //     merchantOrderId: merchantId,
    //     paymentDescription: opts.paymentDescription || "",
    //   });
    // } catch (err) {

    // }


    // const uuidSession = sessionData.checkoutSession;
    const uuidSession = "62353722-ee2e-4991-b899-36613577935b";
    const uuidIntegration = merchantId;

    yuno.startCheckout({
      checkoutSession: "62353722-ee2e-4991-b899-36613577935b",
      elementSelector: "#root",
      countryCode: opts.country ?? "BR",
      language: opts.language ?? "pt",
      showLoading: true,
      showPaymentStatus: true,
      issuersFormEnable: true,
      renderMode: { type: "element", elementSelector: "#root" },
      card: { type: "extends", cardSaveEnable: true },
      onLoading: (args) => console.log(args),
      yunoCreatePayment: async (oneTimeToken: string) => {
        try {
          await this.createPaymentOrder(
            opts,
            oneTimeToken,
            uuidSession,
            uuidIntegration
          );
          await yuno.continuePayment({ showPaymentStatus: true });
        } catch (err) {
          console.error("Erro ao criar pagamento:", err);
          yuno.hideLoader();
        }
      },
      // 4) resultado do pagamento
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
      paymentMethodType: 
    });
  }
}
