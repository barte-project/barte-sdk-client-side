import { EventType, EventTypeData } from "./types";

const isLocalHost = () =>
  Env.SDK_IFRAME_URL.startsWith("http://localhost") ||
  Env.SDK_IFRAME_URL.startsWith("http://127.0.0.1");

export const areOriginsTheSame = (originMessage: string) =>
  isLocalHost() ? true : originMessage === Env.SDK_IFRAME_URL;

const isEventValid = (eventName: EventType) =>
  EventTypeData.includes(eventName);

export const validateOriginAndEventName = (message: MessageEvent) =>
  areOriginsTheSame(message.origin) && isEventValid(message.data?.eventName);
