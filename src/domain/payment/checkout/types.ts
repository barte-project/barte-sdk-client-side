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

export type OrderData = {
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
