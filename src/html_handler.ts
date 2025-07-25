import type { HTMLHandlerProps } from "./types";

export class HTMLHandler {
  constructor({ antifraudService }: HTMLHandlerProps) {
    if (antifraudService === "NETHONE") this.createNethoneScript();
    else if (antifraudService === "OSCILAR") this.createOscilarScript();
  }

  public getIFrame() {
    return document.getElementById(
      "barte-checkout-iframe"
    ) as HTMLIFrameElement;
  }

  public createIframe(): Promise<HTMLIFrameElement> {
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

  private createNethoneScript() {
    const NETHONE_SCRIPT_ID = "nethone-script";
    const scriptAlreadyExists = document.getElementById(NETHONE_SCRIPT_ID);

    if (scriptAlreadyExists) scriptAlreadyExists.remove();

    const nethoneScript = document.createElement("script");
    nethoneScript.type = "text/javascript";
    nethoneScript.id = NETHONE_SCRIPT_ID;
    nethoneScript.crossOrigin = "use-credentials";
    nethoneScript.src =
      "https://d354c9v5bptm0r.cloudfront.net/s/68741/dQItJr.js";
    nethoneScript.async = true;
    document.body.appendChild(nethoneScript);

    const attempt_reference = crypto.randomUUID();

    nethoneScript.onload = () => {
      sessionStorage.setItem("attempt_reference", attempt_reference);
      const nethoneOptions = {
        attemptReference: attempt_reference,
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

    const scriptAlreadyExists = document.getElementById(OSCILAR_SCRIPT_ID);

    if (scriptAlreadyExists) scriptAlreadyExists.remove();

    const oscilarScript = document.createElement("script");
    oscilarScript.type = "text/javascript";
    oscilarScript.id = OSCILAR_SCRIPT_ID;
    oscilarScript.src = "https://zqp{-sand?}.oscilar.com/{envID}/loader.js"; // TODO: obter o formato do ambiente e o envID
    oscilarScript.async = true;
    document.body.appendChild(oscilarScript);

    const oscilarScript2 = document.createElement("script");
    oscilarScript2.type = "text/javascript";

    const scriptContent = `
     (function(w) {
          let __ojsdk__ = w['__ojsdk__'] = w['__ojsdk__'] || {};
          __ojsdk__['getIDs'] = __ojsdk__['getIDs'] || [];

          __ojsdk__['getIDs'].push(function(ojsIDs) {
             // PUT YOUR CODE HERE
             console.log('OJS transaction ID is ' + ojsIDs.transactionID);
             console.log('OJS tab ID is ' + ojsIDs.tabID);
          });
     })(window);
    `;

    oscilarScript2.text = scriptContent;

    document.body.appendChild(oscilarScript2);
  }
}
