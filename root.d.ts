export {};

declare global {
  interface Env {
    readonly SDK_SCRIPT_URL: string;
    readonly SDK_IFRAME_URL: string;
  }

  const Env: Env;
}
