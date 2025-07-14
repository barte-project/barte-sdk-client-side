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

export type FingerPrintResult = {
  userAgent: string;
  language: string;
  colorDepth: number;
  screenHeight: number;
  screenWidth: number;
  timeZoneOffset: string;

  os: string;
  ramCapacity: number;
  model: string;
  resolution: string;
  browser: string;
  version: string;

  javaEnabled: boolean;
  javaScriptEnabled: boolean;
};

export type BarteSDKConstructorProps = {
  accessToken: string;
};

export type CardTokenData = {
  cardHolderName: string;
  cardCVV: string;
  cardExpiryDate: string;
  cardNumber: string;
  buyerUuid: string;
};
