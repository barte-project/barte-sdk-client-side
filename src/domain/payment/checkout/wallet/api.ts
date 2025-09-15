import { getEnv } from "../../../../config/env";
import {
  BarteSDKConstructorProps,
  CreateSessionResultType,
} from "../../../../types";
import { PaymentOrderData, SessionData } from "./types";

class ApiClient {
  private accessToken: string;
  private monolictUrl: string;

  constructor({
    accessToken,
    environment = "production",
  }: BarteSDKConstructorProps) {
    this.accessToken = accessToken;
    this.monolictUrl = getEnv(environment).monolictUrl;
  }

  async request(
    endpoint: string,
    method: string = "GET",
    body: any = null
  ): Promise<any> {
    const headers = {
      "Content-Type": "application/json",
      "X-Token-Sdk": this.accessToken,
    };
    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };
    const response = await fetch(`${this.monolictUrl}${endpoint}`, options);
    return await response.json();
  }

  async createSession(
    sessionData: SessionData
  ): Promise<CreateSessionResultType> {
    return this.request("/v1/sdk/checkout-session", "POST", sessionData);
  }

  async createPaymentOrder(paymentOrderData: PaymentOrderData): Promise<any> {
    return this.request("/v1/sdk/orders", "POST", paymentOrderData);
  }
}

export default ApiClient;
