import { WebConstructor } from "../../web-constructor";
import { loadScript } from "@yuno-payments/sdk-web";
import ApiClient from "./api";
import { YunoInstance } from "@yuno-payments/sdk-web-types";
interface Amount {
  currency: "BRL" | string;
  value: number;
}
interface StartOptions {
  element: string; // Ex: "#root"
  publicKey: string; // NÃO hardcode no fonte
  country?: string; // default "BR"
  language?: "pt" | "en" | "es"; // default "pt"
  buyerId: string;
  amount: Amount;
  method: string; // ex: "WALLET"
  paymentDescription?: string;
  apiToken: string; // para seu backend (orders)
}
export class BarteWallet extends WebConstructor {
  private apiClient: ApiClient;
  private yuno?: YunoInstance;
  // https://sandbox-bff.barte.com/service/payment/v1/session
  constructor(accessToken: string) {
    super(accessToken);
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

  private async ensureYunoInitialized(
    publicKey: string
  ): Promise<YunoInstance> {
    if (this.yuno) return this.yuno;
    const sdk = await loadScript();
    this.yuno = await sdk.initialize(publicKey);
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
      installments: 1, // ajuste conforme sua UI
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

    // Ideal: usar seu ApiClient (ex.: this.apiClient.createOrder(body))
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
  // public async BarteWallet({ data }: any): Promise<any> {
  //   const yunoScript = await loadScript();
  //   const yuno: YunoInstance = await yunoScript.initialize("prod_gAAAAABm7ZDEbdCd5AsQHf0I8wm-rAz_pdIzrr7OvuGA298kQHBdCpIUZRW1NPEIzXi_uSC6apXO7dHptkv41heS0jmE94_mfsKi6v6JFQbQAcsnZITRxa1cBO6JhOvuWAj6qIopfgK_MB_5HTbpuhTbRu423YSutvtcrqJumFJeeIRcy89__G7NrJ3Td2fbkEH8rjbblVBxwT4ax14RiuFbvDLGFRAWhbSi23Zw_Wto2D8WhFUTdVwg-T215N10erG5Y0Uq5fRQ");
  //   const merchantId = crypto.randomUUID();
  //   const sessionData = await this.apiClient.createSession({
  //     country: data.country || 'BR',
  //     amount: {
  //         currency: data.amount?.currency || 'BRL',
  //         value: Number(data.amount?.value || 0)
  //     },
  //     uuidBuyer: data.idBuyer,
  //     merchantOrderId: merchantId,
  //     paymentDescription: data.paymentDescription || ''
  //   });
  //   const uuidSession = sessionData.checkoutSession
  //   const uuidIntegration = merchantId;
  //   const idBuyer = data.idBuyer;
  //   const method = data.method;
  //   yuno.startCheckout({
  //     checkoutSession: sessionData.session,
  //     elementSelector: "#root",
  //     countryCode: "BR",
  //     language: "pt",
  //     showLoading: true,
  //     showPaymentStatus: true,
  //     issuersFormEnable: true,
  //     renderMode: {
  //         type: "element",
  //         elementSelector: "#rootElement",
  //     },
  //     card: {
  //         type: "extends",
  //         cardSaveEnable: true,
  //     },
  //     onLoading: (args) => {
  //         console.log(args);
  //     },

  //     async yunoCreatePayment(oneTimeToken) {
  //         console.log("OTT: " + oneTimeToken);
  //         console.log("uuidSession: " + uuidSession);
  //         console.log("uuidIntegration: " + uuidIntegration);
  //         console.log("uuidBuyer: " + idBuyer);
  //         const updatedData = {
  //           data,
  //           oneTimeToken,
  //           uuidSession,
  //           uuidIntegration,
  //           idBuyer,
  //           method
  //         }
  //         await createPayment(updatedData);
  //         yuno.continuePayment({showPaymentStatus: true});
  //     },

  //     async yunoPaymentResult(data) {
  //         console.log("yunoPaymentResult", data);
  //         // const a = await yuno.mountStatusPayment(uuidSession);
  //         window.location.reload()
  //         // console.log(a);
  //     },

  //     yunoError: (error) => {
  //         console.log("There was an error", error);
  //         yuno.hideLoader();
  //     },
  //   });

  //   yuno.mountCheckoutLite({
  //       paymentMethodType: data.method
  //   });
  // }
  public async start(opts: StartOptions): Promise<void> {
    const yuno = await this.ensureYunoInitialized(opts.publicKey);
    // 1) cria sessão no seu backend
    const merchantId = crypto.randomUUID();
    const sessionData = await this.apiClient.createSession({
      country: opts.country ?? "BR",
      amount: {
        currency: opts.amount.currency || "BRL",
        value: this.parseAmountValue(opts.amount.value),
      },
      uuidBuyer: opts.buyerId,
      merchantOrderId: merchantId,
      paymentDescription: opts.paymentDescription || "",
    });
    const uuidSession = sessionData.checkoutSession;
    const uuidIntegration = merchantId;
    // 2) inicia o checkout com UM seletor só
    yuno.startCheckout({
      checkoutSession: sessionData.checkoutSession,
      elementSelector: opts.element,
      countryCode: opts.country ?? "BR",
      language: opts.language ?? "pt",
      showLoading: true,
      showPaymentStatus: true,
      issuersFormEnable: true,
      renderMode: { type: "element", elementSelector: opts.element },
      card: { type: "extends", cardSaveEnable: true },
      onLoading: (args) => console.log(args),
      // 3) callback de criação de pagamento
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
        // opcional: consultar status
        // const status = await yuno.mountStatusPayment(uuidSession);
        window.location.reload();
      },

      yunoError: (error) => {
        console.error("Erro no Yuno:", error);
        yuno.hideLoader();
      },
    });

    // ⚠️ Use OU startCheckout OU mountCheckoutLite — evite ambos.
    // yuno.mountCheckoutLite({ paymentMethodType: opts.method });
  }
}
