import { SessionData } from "./types";

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
  async createBuyerYuno(barteBuyerUuid: string): Promise<any> {
    return this.request(`/v1/buyer/yuno/${barteBuyerUuid}`, "POST");
  }
  async createSession(sessionData: SessionData): Promise<any> {
    return this.request("/service/payment/v1/session", "POST", sessionData);
  }
}

export default ApiClient;
