import { EventType, EventTypeData } from "./types";

const isLocalHost = () =>
  Env.SDK_IFRAME_URL.startsWith("http://localhost") ||
  Env.SDK_IFRAME_URL.startsWith("http://127.0.0.1");

export const areOriginsTheSame = (originMessage: string) =>
  isLocalHost() ? true : originMessage === Env.SDK_IFRAME_URL;

export const isEventValid = (eventName: EventType) =>
  EventTypeData.includes(eventName);

export const validateOriginAndEventName = (
  message: MessageEvent,
  eventType: EventType
) =>
  areOriginsTheSame(message.origin) &&
  isEventValid(message.data?.type) &&
  eventType === message.data?.type;
