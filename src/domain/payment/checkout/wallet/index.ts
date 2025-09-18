import { loadScript } from "@yuno-payments/sdk-web";
import { YunoInstance } from "@yuno-payments/sdk-web-types";
import { EnvironmentType, getEnv } from "../../../../config/env";
import {
  BarteErrorProps,
  BarteSDKConstructorProps,
  CreateSessionResultType,
} from "../../../../types";
import { WebConstructor } from "../../../web-constructor";
import { createIframe } from "../../token/iframe";
import {
  CreateSessionOptions,
  PaymentOptions,
  PaymentOrderData,
  YunoEnvironmentOptions,
} from "./types";

export default class Wallet extends WebConstructor {
  private yuno?: YunoInstance;

  constructor({ accessToken, environment }: BarteSDKConstructorProps) {
    super({ accessToken, environment });
  }

  private formatEnvironment(environment: EnvironmentType) {
    const formattedEnvironment = {
      local: "dev",
      dev: "staging",
      production: "prod",
      sandbox: "sandbox",
    };
    return formattedEnvironment[environment] as YunoEnvironmentOptions;
  }

  private parseAmountValue(v: number | string): number {
    if (typeof v === "number") return v;
    return Number(String(v).replace(/\./g, "").replace(",", "."));
  }

  private isBarteDuplicatedCustomerError(response: BarteErrorProps): boolean {
    return response?.errors?.[0]?.code === "BAR-1801";
  }

  private async ensureYunoInitialized(
    publicKey: string
  ): Promise<YunoInstance> {
    if (this.yuno) return this.yuno;
    const { initialize } = await loadScript({
      env: this.formatEnvironment(this.environment),
    });
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
        oneTimeToken,
        checkoutSessionUuid: uuidSession,
        integrationOrderId: uuidIntegration,
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
        softDescriptor: "soft descriptor",
      },
      metadata: [{ key: "Version", value: "1" }],
      uuidBuyer: data.buyerId,
    };
  }

  private async createSession(
    data: CreateSessionOptions
  ): Promise<CreateSessionResultType> {
    const iframe = await createIframe();
    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        console.log({ origin: message.origin, url: Env.SDK_IFRAME_URL });
        if (message.origin !== Env.SDK_IFRAME_URL) return;

        window.removeEventListener("message", listener);

        if (!message.data.error) {
          const messageData = message.data;
          // TODO: Mapear outros cenários de erros possíveis aqui
          if (Array.isArray(messageData.errors) && messageData.errors.length)
            reject(messageData);

          resolve(messageData);
        }
        reject(message.data);
      };

      window.addEventListener("message", listener);

      iframe.contentWindow?.postMessage(
        {
          type: "submitCreateSession",
          data: {
            country: data.country ?? "BR",
            amount: {
              currency: data.amount?.currency ?? "BRL",
              value: this.parseAmountValue(data.amount.value),
            },
            uuidBuyer: data.uuidBuyer,
            merchantOrderId: data.merchantOrderId,
            paymentDescription: data.paymentDescription || "",
          },
          config: {
            accessToken: this.accessToken,
            environment: this.environment,
          },
        },
        Env.SDK_IFRAME_URL
      );
    });
  }
  private async createPaymentOrder(data: PaymentOrderData) {
    const iframe = await createIframe();
    return new Promise((resolve, reject) => {
      const listener = (message: MessageEvent<any>) => {
        console.log({ origin: message.origin, url: Env.SDK_IFRAME_URL });
        if (message.origin !== Env.SDK_IFRAME_URL) return;

        window.removeEventListener("message", listener);

        if (!message.data.error) {
          const messageData = message.data;
          // TODO: Mapear outros cenários de erros possíveis aqui
          if (Array.isArray(messageData.errors) && messageData.errors.length)
            reject(messageData);
          resolve(messageData);
        }
        reject(message.data);
      };
      window.addEventListener("message", listener);
      iframe.contentWindow?.postMessage(
        {
          type: "submitCreatePayment",
          data,
          config: {
            accessToken: this.accessToken,
            environment: this.environment,
          },
        },
        Env.SDK_IFRAME_URL
      );
    });
  }

  public async initialize(data: PaymentOptions): Promise<void> {
    const yuno = await this.ensureYunoInitialized(
      getEnv(this.environment).yunoKey
    );

    const merchantId = crypto.randomUUID();

    const sessionData = await this.createSession({
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

    await yuno.startCheckout({
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
      yunoCreatePayment: async (oneTimeToken) => {
        try {
          const body = this.buildPaymentPayload(
            data,
            oneTimeToken,
            uuidSession,
            uuidIntegration
          );
          await this.createPaymentOrder(body);

          await yuno.continuePayment({
            showPaymentStatus: true,
          });
        } catch (err) {
          console.error("Erro ao criar pagamento:", err);
          yuno.hideLoader();
        }
      },
      yunoPaymentResult: async (result: unknown) => {
        console.log("yunoPaymentResult", result);
        window.location.replace(data.successURL);
      },
      yunoError: (error) => {
        console.error("Erro no Yuno:", error);
        yuno.hideLoader();
        window.location.replace(data.errorURL);
      },
    });

    await yuno.mountCheckoutLite({
      paymentMethodType: data.method,
    });
  }
}

export { Wallet };
