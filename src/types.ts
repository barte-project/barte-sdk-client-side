export type TokenizeResult = {
  uuid: string;
  status: string;
  createdAt: string;
  brand: string;
  cardHolderName: string;
  cvvChecked: boolean;
  fingerprint: string;
  first6digits: string;
  last4digits: string;
  buyerId: string;
  expirationMonth: string;
  expirationYear: string;
  cardId: string;
};

export type TokenizeResultCallback = (cardToken: string) => any;

export type BarteSDKConstructorProps = {
  accessToken: string;
  tokenizeResultCallback: TokenizeResultCallback;
};

const styleProps = [
  "border",
  "backgroundColor",
  "padding",
  "height",
  "fontSize",
] as const;

type StyleProps = (typeof styleProps)[number];

type StyleObject = {
  [k in StyleProps]?: string | number;
};

export type IframeProps = {
  tokenizeCallback?: (cardToken: string) => any;
  styles: {
    container?: StyleObject;
    // input: {};
    // errorMessage: {};
  };
  inputs?: {
    cvv?: {
      label?: string;
    };
  };
};

export type CardTokenData = {
  cardHolderName: string;
  cardCVV: string;
  cardExpiryDate: string;
  cardNumber: string;
  buyerUuid: string;
};
