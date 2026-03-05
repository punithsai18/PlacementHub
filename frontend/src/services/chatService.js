import { chatApi } from './api';

let activeWs = null;

/**
 * Initialize a Web PubSub WebSocket connection for real-time chat.
 * Closes any existing connection before creating a new one.
 *
 * @param {Function} onMessage - Callback invoked when a message is received.
 * @param {Function} onConnected - Callback invoked when the connection opens.
 * @param {Function} onDisconnected - Callback invoked when the connection closes.
 * @returns {Object|null} Controls for the WebSocket connection, or null on failure.
 */
export async function initChatConnection(onMessage, onConnected, onDisconnected) {
  // Close any pre-existing connection before creating a new one
  if (activeWs && activeWs.readyState === WebSocket.OPEN) {
    activeWs.close();
    activeWs = null;
  }

  try {
    const { data } = await chatApi.getToken();
    const ws = new WebSocket(data.url);

    ws.onopen = () => {
      console.log('Chat WebSocket connected');
      if (onConnected) onConnected();
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onMessage) onMessage(payload);
      } catch {
        if (onMessage) onMessage({ text: event.data });
      }
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
      if (activeWs === ws) activeWs = null;
      if (onDisconnected) onDisconnected();
    };

    ws.onerror = (err) => {
      console.error('Chat WebSocket error:', err);
    };

    activeWs = ws;

    return {
      send: (message) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      },
      disconnect: () => ws.close()
    };
  } catch (err) {
    console.error('Failed to initialize chat connection:', err.message);
    return null;
  }
}

/**
 * Disconnect the active Web PubSub WebSocket connection.
 */
export function disconnectChat() {
  if (activeWs && activeWs.readyState === WebSocket.OPEN) {
    activeWs.close();
    activeWs = null;
  }
}
