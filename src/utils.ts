const getIFrame = (): HTMLIFrameElement | null =>
  document.getElementById("barte-checkout-iframe") as HTMLIFrameElement;

export const removeIframe = () => getIFrame()?.remove();

export function createIframe(): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    removeIframe();
    const iframe = document.createElement("iframe");
    iframe.src = "http://localhost:5500/dist/index.html";
    iframe.id = "barte-checkout-iframe";

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

export function dateValidator(value: string) {
  const expirationDateRegex = /^(0[1-9]|1[0-2])\/(\d{4})$/;

  if (!expirationDateRegex.test(value)) return false;

  if (Number(value.substring(3, 7)) < new Date().getFullYear()) return false;

  if (Number(value.substring(0, 2)) < new Date().getMonth() + 1) return false;

  return true;
}

export function luhnValidator(number: string) {
  const cleanNumber = number.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
