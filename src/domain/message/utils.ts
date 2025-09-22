import { EventType, EventTypeData } from "./types";

const isLocalHost = () =>
  Env.SDK_IFRAME_URL.startsWith("http://localhost") ||
  Env.SDK_IFRAME_URL.startsWith("http://127.0.0.1");

export const areOriginsTheSame = (originMessage: string) => {
  console.log({
    originMessage,
    iframeURL: Env.SDK_IFRAME_URL,
  });
  return isLocalHost() ? true : originMessage === Env.SDK_IFRAME_URL;
};

const isEventValid = (eventName: EventType) =>
  EventTypeData.includes(eventName);

export const validateOriginAndEventName = (
  message: MessageEvent,
  eventType: EventType
) => {
  console.log({
    originMessage: message.origin,
    iframeURL: Env.SDK_IFRAME_URL,
    eventType,
    eventMessage: message.data?.type,
  });
  return (
    areOriginsTheSame(message.origin) &&
    isEventValid(message.data?.type) &&
    eventType === message.data?.type
  );
};
