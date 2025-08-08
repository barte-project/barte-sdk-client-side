export abstract class WebConstructor {
  protected accessToken: string;

  constructor(accessToken: string) {
    if (!window)
      throw new Error(
        "O objeto 'window' não está presente! O SDK Barte deve ser usado somente no contexto do Browser!"
      );

    if (!accessToken) throw new Error("Access Token é obrigatório!");

    this.accessToken = accessToken;
  }
}
