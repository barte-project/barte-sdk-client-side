import { getEnv } from "../../../../config/env";
import { BarteSDKConstructorProps } from "../../../../types";
import { PaymentOrderData, ServiceOptions, SessionData } from "./types";

class ApiClient {
  private accessToken: string;
  private monolictUrl: string;
  private paymentUrl: string;
  constructor({
    accessToken,
    environment = "production",
  }: BarteSDKConstructorProps) {
    this.accessToken = accessToken;
    this.monolictUrl = getEnv(environment).monolictUrl;
    this.paymentUrl = getEnv(environment).paymentUrl;
  }
  async request(
    endpoint: string,
    method: string = "GET",
    body: any = null,
    service: ServiceOptions = "monolict"
  ): Promise<any> {
    const getUrl = (service: ServiceOptions) => {
      const urls = {
        monolict: `${this.monolictUrl}${endpoint}`,
        payment: `${this.paymentUrl}${endpoint}`,
      };
      return urls[service];
    };
    const headers = {
      "Content-Type": "application/json",
      "X-Token-Sdk": this.accessToken,
    };
    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };
    const response = await fetch(getUrl(service), options);
    return await response.json();
  }
  async createBuyerYuno(barteBuyerUuid: string): Promise<any> {
    return this.request(`v1/buyer/yuno/${barteBuyerUuid}`, "POST");
  }
  async createSession(sessionData: SessionData): Promise<any> {
    return this.request("v1/session", "POST", sessionData, "payment");
  }
  async createPaymentOrder(paymentOrderData: PaymentOrderData): Promise<any> {
    return this.request("v1/orders", "POST", paymentOrderData, "payment");
  }
}

export default ApiClient;
