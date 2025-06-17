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
