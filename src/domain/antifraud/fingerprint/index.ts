import { WebConstructor } from "../../web-constructor";
import { AntifraudService } from "../types";
import type { BarteFingerPrintResult, CreateScriptProps } from "./types";
import { decodeJwtPayload } from "./utils";

export class BarteFingerprint extends WebConstructor {
  private userAgent: string;
  private antifraudService: AntifraudService;

  constructor(accessToken: string) {
    super(accessToken);
    const { antifraudService } = decodeJwtPayload(accessToken);
    this.antifraudService = antifraudService;
    this.userAgent = navigator.userAgent;
  }

  public async barteFingerPrint(): Promise<BarteFingerPrintResult> {
    const {
      // @ts-ignore
      deviceMemory,
      language,
    } = navigator;

    const {
      screen: { colorDepth, width, height },
    } = window;

    const resolution = `${width}x${height}`;

    let model = "";

    // @ts-ignore
    if (navigator.userAgentData) {
      // @ts-ignore
      const result = await navigator.userAgentData.getHighEntropyValues([
        "model",
        "platformVersion",
      ]);

      model = result.model;
    }

    const browser = this.getBrowserName();
    const os = this.getDeviceName();

    return {
      userAgent: this.userAgent,
      ramCapacity: deviceMemory,
      language,
      resolution,
      colorDepth,
      screenWidth: width,
      screenHeight: height,
      model,
      os,
      timeZoneOffset: new Date().getTimezoneOffset().toString(),
      browser,
      version: this.getBrowserVersion({ browserName: browser, os }),
      javaEnabled: navigator.javaEnabled(),
      javaScriptEnabled: true,
    };
  }

  public initializeAntifraud() {
    if (this.antifraudService === "NETHONE") this.createNethoneScript();
    else if (this.antifraudService === "OSCILAR") this.createOscilarScript();
  }

  public commitAntifraud() {
    if (this.antifraudService !== "OSCILAR") return;

    const w = window as any;
    let __ojsdk__ = (w["__ojsdk__"] = w["__ojsdk__"] || {});
    __ojsdk__["commit"] = __ojsdk__["commit"] || [];
  }

  private getBrowserVersion({
    browserName,
    os,
  }: {
    browserName: string;
    os: string;
  }): string {
    function getBrowserName(): string {
      const formatedBrowserName = {
        Chrome: "CriOS",
        Firefox: "FxiOS",
        Edge: "EdgiOS",
        Opera: "OPR",
      } as const;

      return (
        formatedBrowserName[browserName as keyof typeof formatedBrowserName] ??
        browserName
      );
    }

    const finalBrowserName = os === "iOS" ? getBrowserName() : browserName;
    const regex = new RegExp(`${finalBrowserName}/([\\d.]+)`);
    const result = this.userAgent.match(regex);

    return result && result[1] ? result[1] : "";
  }

  private getBrowserName(): string {
    const ua = this.userAgent;
    if (ua.includes("Firefox") || ua.includes("FxiOS")) return "Firefox";
    if (ua.includes("Edg") || ua.includes("EdgiOS")) return "Edge";
    if (ua.includes("Chrome") || ua.includes("CriOS")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Brave")) return "Brave";
    return "";
  }

  private getDeviceName(): string {
    const ua = this.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android";
    if (ua.includes("Win")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    return "";
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
    return crypto.randomUUID();
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
      src: "https://zqp-sand.oscilar.com/8net82zi/loader.js",
    });
  }
}
