import type { HttpServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

type SocketMessage = {
  type: string;
  message: string;
  data?: any;
};

export function attachWebSocket(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    if (new URL(req.url, 'http://localhost').pathname !== '/ws') return;
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        switch (JSON.parse(data.toString()).type) {
            case 'echo': {
                // reply to this message with an echo
                const reply: SocketMessage = {
                    type: 'echo',
                    message: JSON.parse(data.toString()).message,
                    data: JSON.parse(data.toString()).data
                };
                ws.send(JSON.stringify(reply));
                break;
            }

            // registration
            case 'register': {
                // handle registration logic here
                const reply: SocketMessage = {
                    type: 'register',
                    message: `Registered successfully`,
                    data: {
                        broadcastName: JSON.parse(data.toString()).data?.broadcastName
                    }
                };
                ws.send(JSON.stringify(reply));
                break;
            }






            default: {
                // reply to this message with an echo
                const reply: SocketMessage = {
                    type: 'echo',
                    message: `Unknown message type: ${JSON.parse(data.toString()).type}`,
                    data: null
                };
                ws.send(JSON.stringify(reply));
                break;
            }
        }

    });
  });
  return wss;
}