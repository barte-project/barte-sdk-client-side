import type {
  AntifraudService,
  CreateScriptProps,
  HTMLHandlerProps,
} from "./types";

export class HTMLHandler {
  private attemptReference: string;
  private buyerUuid?: string;
  private antifraudService: AntifraudService;

  constructor({ antifraudService }: HTMLHandlerProps) {
    if (antifraudService === "NETHONE") this.createNethoneScript();
    else if (antifraudService === "OSCILAR") this.createOscilarScript();
  }

  public commitAntifraud() {
    if (this.antifraudService === "OSCILAR" && !this.buyerUuid)
      throw new Error(
        `Buyer uuid é obrigatório para o serviço de antifraude ${this.antifraudService}`
      );

    const w = window as any;
    let __ojsdk__ = (w["__ojsdk__"] = w["__ojsdk__"] || {});
    __ojsdk__["commit"] = __ojsdk__["commit"] || [];

    __ojsdk__["commit"].push({
      userID: this.buyerUuid,
      sessionID: this.attemptReference,
    });
  }

  public static getIFrame(): HTMLIFrameElement {
    return document.getElementById(
      "barte-checkout-iframe"
    ) as HTMLIFrameElement;
  }

  public static removeIframe() {
    this.getIFrame().remove();
  }

  public static createIframe(): Promise<HTMLIFrameElement> {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.src = "https://sdk-client.barte.com";
      iframe.id = "barte-checkout-iframe";
      iframe.style = "display: none";

      iframe.onload = () => resolve(iframe);

      iframe.onerror = () => reject(new Error("Erro ao carregar iframe"));

      const container = document.querySelector("body");
      if (!container) {
        reject(new Error("Elemento body não encontrado!"));
        return;
      }

      container.appendChild(iframe);
    });
  }

  private createScript({
    id,
    src,
    async = true,
    crossOrigin,
  }: CreateScriptProps): HTMLScriptElement {
    const scriptAlreadyExists = document.getElementById(id);

    if (scriptAlreadyExists) scriptAlreadyExists.remove();

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = id;
    script.src = src;
    script.async = async;
    if (crossOrigin) script.crossOrigin = crossOrigin;
    document.body.appendChild(script);

    return script;
  }

  private generateAttemptReference(): string {
    const attemptReference = crypto.randomUUID();

    this.attemptReference = attemptReference;

    return attemptReference;
  }

  private createNethoneScript() {
    const NETHONE_SCRIPT_ID = "nethone-script";

    const nethoneScript = this.createScript({
      id: NETHONE_SCRIPT_ID,
      src: "https://d354c9v5bptm0r.cloudfront.net/s/68741/dQItJr.js",
      crossOrigin: "use-credentials",
    });

    const attemptReference = this.generateAttemptReference();

    nethoneScript.onload = () => {
      const nethoneOptions = {
        attemptReference,
        sensitiveFields: [
          "cardHolderName",
          "cardCvv",
          "cardExpirationDate",
          "cardNumber",
        ],
      };

      if ((window as any).dftp) {
        (window as any).dftp.init(nethoneOptions);
      } else {
        nethoneScript.addEventListener("load", () => {
          if ((window as any).dftp) {
            (window as any).dftp.init(nethoneOptions);
          }
        });
      }
    };
  }

  private createOscilarScript() {
    const OSCILAR_SCRIPT_ID = "oscilar-script";

    this.createScript({
      id: OSCILAR_SCRIPT_ID,
      src: "https://zqp{-sand?}.oscilar.com/{envID}/loader.js",
    });

    this.generateAttemptReference();
  }
}
