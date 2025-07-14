import type { FingerPrintResult } from "./types";

export class FingerPrint {
  private userAgent: string;

  constructor() {
    this.userAgent = navigator.userAgent;
  }

  public async fingerPrint(): Promise<FingerPrintResult> {
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
    let version = "";

    // @ts-ignore
    if (navigator.userAgentData) {
      // @ts-ignore
      const result = await navigator.userAgentData.getHighEntropyValues([
        "model",
        "platformVersion",
      ]);

      model = result.model;
      version = result.platformVersion;
    }

    return {
      userAgent: this.userAgent,
      ramCapacity: deviceMemory,
      language,
      resolution,
      colorDepth,
      screenWidth: width,
      screenHeight: height,
      model,
      os: this.getDeviceName(),
      timeZoneOffset: new Date().getTimezoneOffset().toString(),
      browser: this.getBrowserName(),
      version: this.getBrowserVersion(
        this.getBrowserName(),
        this.getDeviceName()
      ),
      javaEnabled: navigator.javaEnabled(),
      javaScriptEnabled: true,
    };
  }

  private getBrowserVersion(browserName: string, os: string): string {
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

    if (result && result[1]) return result[1];

    return "";
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
}
