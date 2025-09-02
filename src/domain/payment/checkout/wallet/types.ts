export type SessionData = {
  country: string;
  amount: {
    currency: string;
    value: number;
  };
  uuidBuyer: string;
  merchantOrderId: string;
  paymentDescription: string;
};

export type PaymentOrderData = {
  startDate: string;
  value: number;
  installments: number;
  title: string;
  payment: {
    method: string;
    wallet: {
      oneTimeToken: string;
      checkoutSessionUuid: string;
      integrationOrderId: string;
    };
    fraudData: {
      internationalDocument: {
        documentNumber: string;
        documentType: string;
        documentNation: string;
      };
      name: string;
      email: string;
      phone: string;
      billingAddress: {
        country: string;
        state: string;
        city: string;
        district: string;
        street: string;
        zipCode: string;
      };
    };
  };
  metadata: any;
  uuidBuyer: string;
};

export type CheckoutConfig = {
  checkoutSession: string;
  elementSelector: string;
  countryCode: string;
  language: any;
  showLoading: boolean;
  keepLoader: boolean;
  showPaymentStatus: boolean;
  issuersFormEnable: boolean;
  renderMode: {
    type: string;
    elementSelector: string;
  };
  card: {
    type: string;
    cardSaveEnable: boolean;
  };
  onLoading: (args: any) => void;
  yunoCreatePayment: (oneTimeToken: string) => Promise<void>;
  yunoPaymentResult: (data: any) => Promise<void>;
  yunoError: (error: any) => void;
};

export type YunoWalletData = {
  oneTimeToken: string;
  checkoutSessionUuid: string;
  integrationOrderId: string;
};

export type YunoPaymentData = {
  startDate: string;
  value: number;
  installments: number;
  title: string;
  payment: {
    method: string;
    wallet: YunoWalletData;
    fraudData: {
      internationalDocument: {
        documentNumber: string;
        documentType: string;
        documentNation: string;
      };
      name: string;
      email: string;
      phone: string;
      billingAddress: {
        country: string;
        state: string;
        city: string;
        district: string;
        street: string;
        zipCode: string;
      };
    };
  };
  metadata: any;
  uuidBuyer: string;
};

export type ServiceOptions = "monolict" | "payment";

export interface Amount {
  currency: "BRL" | string;
  value: number;
}
export interface PaymentOptions {
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
    country: string;
    state: string;
    city: string;
    district: string;
    street: string;
    zipCode: string;
  };
  successURL: string;
  errorURL: string;
}
export type YunoEnvironmentOptions = "dev" | "prod" | "sandbox" | "staging";

export type CreateSessionOptions = {
  country?: string;
  uuidBuyer: string;
  amount: Amount;
  paymentDescription: string;
  merchantOrderId: string;
};
