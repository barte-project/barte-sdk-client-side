// TODO: adicionar typescript e colocar metodos como privados
// TODO: criar sdk para ficar disponível tanto como sdk quanto lib npm
// TODO (validate): criar estado no sdk para indicar qual etapa atualmente se encontra (no caso de chamar o tokenize e ficar aguardando)
// TODO: subir sdk em uma url e usá-lo em outro domínio e verificar questão de cors
class BarteSDK {
    static IFRAME_ID = 'barte-checkout-iframe';
    static IFRAME_SRC = 'index.html'; // replace by iframe final url

    constructor({
        apiKey,
        resultCallback
    }) {
        if (!apiKey || !resultCallback) throw new Error("All constructor data are required!")
        this.resultCallback = resultCallback
        this.apiKey = apiKey;

        console.log("SDK started...")

        this.createIframe()
        this.setup()
    }


    tokenize({ cardHolderName, cardCVV, cardExpiryDate, cardNumber }) {
        if (cardNumber.length < 16) throw new Error("Invalid Card Number")

        if (!this.luhnValidator(cardNumber)) throw new Error("Invalid Card Number Format")

        if (!cardHolderName) throw new Error("Invalid Card Holder Name")

        if (!this.dateValidator(cardExpiryDate)) throw new Error("Invalid date format")

        if (/\D/g.test(cardCVV) || cardCVV.length > 4 || cardCVV.length < 3) throw new Error("Invalid Card CVV")

        const iframe = this.getIFrame();

        iframe.onload = () => {
            iframe.contentWindow.postMessage({ type: "submitForm", data: { cardHolderName: cardHolderName.trim(), cardCVV, cardExpiryDate, cardNumber } }, "*")
        };
    }


    // Private methods
    getIFrame() {
        return document.getElementById(BarteSDK.IFRAME_ID);
    }

    createIframe() {
        const iframe = document.createElement("iframe")
        iframe.src = BarteSDK.IFRAME_SRC
        iframe.id = BarteSDK.IFRAME_ID
        iframe.style = "display: none"

        const rootElement = document.querySelector("body")

        if (!rootElement) throw new Error(`Element ${this.rootElement} not found!`)

        rootElement.appendChild(iframe)
    }

    setup() {
        window.addEventListener("message", (message) => this.resultCallback(message.data));

        const iframe = this.getIFrame()

        iframe.onload = () => {
            iframe.contentWindow.postMessage({ type: "apiKey", apiKey: this.apiKey }, "*");
        };
    }

    // MM/YY
    dateValidator(value) {
        const regex = /^(0[1-9]|1[0-2])\/(\d{2})$/;

        if (!regex.test(value)) return false

        if (Number(value.substring(3, 5)) < new Date().getFullYear() % 1000) return false

        if (Number(value.substring(0, 2)) < new Date().getMonth() + 1) return false

        return true
    }

    luhnValidator(number) {
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

}

window.BarteSDK = BarteSDK;