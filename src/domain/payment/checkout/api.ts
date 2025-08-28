import { OrderData, SessionData } from "./types";

class ApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://sandbox-bff.barte.com";
  }
  async request(
    endpoint: string,
    method: string = "GET",
    body: any = null
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "X-Token-Api": this.apiKey,
    };
    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
  // /buyer/yuno/0f8fccf8-a4d9-4688-97f7-4340b4a02d02
  async createBuyerYuno(barteBuyerUuid: string): Promise<any> {
    return this.request(`/v1/buyer/yuno/${barteBuyerUuid}`, "POST");
  }
  //https://dev-bff.barte.com/service/payment/v1/session
  async createSession(sessionData: SessionData): Promise<any> {
    return this.request("/service/payment/v1/session", "POST", sessionData);
  }
  //https://dev-bff.barte.com/service/payment/v1/orders
  async createOrder(orderData: OrderData): Promise<any> {
    return this.request("/service/payment/v1/orders", "POST", orderData);
  }

  async createPayment(
    data: any,
    env: string,
    oneTimeToken: string,
    uuidSession: string,
    uuidIntegration: string,
    idBuyer: string,
    method: string
  ): Promise<any> {
    return this.request("/service/payment/v1/payments", "POST", {
      data,
      env,
      oneTimeToken,
      uuidSession,
      uuidIntegration,
      idBuyer,
      method,
    });
  }
}

export default ApiClient;
