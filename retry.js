const { proto } = require("@whiskeysockets/baileys");

export const makeRetryHandler = () => {
  const messagesMap = {};

  const addMessage = async (message) => {
    const id = message.key.id ?? "";

    messagesMap[id] = {
      message: cleanMessage(message),
      ts: Date.now(),
    };

    return message;
  };

  const getMessage = (msgKey) => {
    return messagesMap[msgKey].message;
  };

  const removeMessage = (msgKey) => {
    delete messagesMap[msgKey];
  };

  const getMessageKeys = () => {
    return Object.keys(messagesMap);
  };

  const cleanMessage = (message) => {
    const msg = message.message ?? {};
    return msg;
  };

  const clearObseleteMessages = () => {
    const keys = Object.keys(messagesMap);
    keys.forEach((key) => {
      const ts = messagesMap[key].ts;
      if (Date.now() - ts > 60_000) {
        removeMessage(key);
      }
    });
  };

  return {
    addMessage,
    getMessage,
    removeMessage,
    getMessageKeys,
    cleanMessage,
    clearObseleteMessages,
    getHandler: (message) => {
      const msg = getMessage(message.id ?? "");
      console.log("Retrying message", msg);
      return msg;
    },
  };
};
const makeRetryHandler = () => {
  const messagesMap = {};

  const addMessage = async (message) => {
    const id = message.key.id || "";

    messagesMap[id] = {
      message: cleanMessage(message),
      ts: Date.now(),
    };

    return message;
  };

  const getMessage = (msgKey) => {
    return messagesMap[msgKey].message;
  };

  const removeMessage = (msgKey) => {
    delete messagesMap[msgKey];
  };

  const getMessageKeys = () => {
    return Object.keys(messagesMap);
  };

  const cleanMessage = (message) => {
    const msg = message.message || {};
    return msg;
  };

  const clearObsoleteMessages = () => {
    const keys = Object.keys(messagesMap);
    keys.forEach((key) => {
      const ts = messagesMap[key].ts;
      if (Date.now() - ts > 60_000) {
        removeMessage(key);
      }
    });
  };

  return {
    addMessage,
    getMessage,
    removeMessage,
    getMessageKeys,
    cleanMessage,
    clearObsoleteMessages,
    getHandler: (message) => {
      const msg = getMessage(message.id || "");
      console.log("Retrying message", msg);
      return msg;
    },
  };
};
