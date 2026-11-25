import type { HttpServer } from 'vite';
import { WebSocket, WebSocketServer, type RawData } from 'ws';
import {
  registerBroadcast,
  unregisterBroadcastsForSocket
} from './broadcasts';

type SocketResponse = {
  type: 'echo' | 'register' | 'error';
  message: string;
  data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sendResponse(socket: WebSocket, response: SocketResponse) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(response), (error) => {
    if (error) console.error('Failed to send remote-management response:', error);
  });
}

function sendError(socket: WebSocket, message: string) {
  sendResponse(socket, { type: 'error', message });
}

function handleMessage(socket: WebSocket, rawMessage: RawData) {
  let message: unknown;
  try {
    message = JSON.parse(rawMessage.toString());
  } catch {
    sendError(socket, 'Message must contain valid JSON.');
    return;
  }

  if (!isRecord(message) || typeof message.type !== 'string') {
    sendError(socket, 'Message must include a string type.');
    return;
  }

  switch (message.type) {
    case 'echo': {
      if (typeof message.message !== 'string') {
        sendError(socket, 'Echo messages must include a string message.');
        return;
      }

      sendResponse(socket, {
        type: 'echo',
        message: message.message,
        data: message.data
      });
      return;
    }

    case 'register': {
      if (!isRecord(message.data) || typeof message.data.broadcastName !== 'string') {
        sendError(socket, 'Register messages must include a broadcastName.');
        return;
      }

      const result = registerBroadcast(message.data.broadcastName, socket);
      if (!result.success) {
        const errorMessage = result.reason === 'invalid-name'
          ? 'Broadcast name cannot be empty.'
          : `Broadcast "${message.data.broadcastName}" is already registered.`;
        sendError(socket, errorMessage);
        return;
      }

      sendResponse(socket, {
        type: 'register',
        message: 'Registered successfully',
        data: { broadcastName: result.broadcast.name }
      });
      return;
    }

    default:
      sendError(socket, `Unsupported message type: ${message.type}`);
  }
}

export function attachWebSocket(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    if (new URL(request.url ?? '/', 'http://localhost').pathname !== '/ws') return;
    wss.handleUpgrade(request, socket, head, (client) => wss.emit('connection', client, request));
  });

  wss.on('connection', (socket) => {
    socket.on('message', (data, isBinary) => {
      if (isBinary) {
        sendError(socket, 'Only text messages are supported.');
        return;
      }
      handleMessage(socket, data);
    });
    socket.on('close', () => unregisterBroadcastsForSocket(socket));
    socket.on('error', (error) => {
      console.error('Remote-management WebSocket error:', error);
      unregisterBroadcastsForSocket(socket);
    });
  });

  return wss;
}
