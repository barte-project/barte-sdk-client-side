const getIFrame = (): HTMLIFrameElement | undefined =>
  document.getElementById("barte-checkout-iframe") as HTMLIFrameElement;

export const removeIframe = () => getIFrame()?.remove();

export function createIframe(): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    getIFrame()?.remove();

    const iframe = document.createElement("iframe");
    iframe.src = import.meta.env.iframeUrl;
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
