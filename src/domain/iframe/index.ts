export class Iframe {
  static getIFrame() {
    return document.getElementById(
      "barte-checkout-iframe"
    ) as HTMLIFrameElement;
  }

  static removeIframe() {
    this.getIFrame().remove();
  }

  static createIframe(): Promise<HTMLIFrameElement> {
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
}
