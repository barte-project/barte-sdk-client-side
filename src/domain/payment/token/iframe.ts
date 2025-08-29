import { EnvironmentType, getEnv } from "../../../config/env";

const getIFrame = (): HTMLIFrameElement | null =>
  document.getElementById("barte-checkout-iframe") as HTMLIFrameElement;

export function createIframe(
  currentEnvironment: EnvironmentType
): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const currentIframe = getIFrame();

    if (currentIframe) {
      resolve(currentIframe);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.src = getEnv(currentEnvironment).iframeUrl;
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
