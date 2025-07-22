import { Server, WebSocket, RawData } from 'ws';
import { Server as HttpServer } from 'http';

const clients = new Map<string, WebSocket>();

type IncomingMessage = {
    type: 'register' | 'invite';
    email?: string;
    to?: string;
    from?: string;
    className?: string;
};

export const setupWebSocket = (server: HttpServer, path = '/api') => {
    const wss = new Server({ server, path });

    wss.on('connection', (ws: WebSocket) => {
        ws.on('message', (msg: RawData) => {
            const data = JSON.parse(msg.toString()) as IncomingMessage;

            if (data.type === 'register' && data.email) {
                clients.set(data.email, ws);
                ws.send(JSON.stringify({ type: 'registered', success: true }));
            }

            if (data.type === 'invite' && data.to && clients.has(data.to)) {
                const target = clients.get(data.to);
                target?.send(
                    JSON.stringify({
                        type: 'invite',
                        payload: {
                            from: data.from,
                            className: data.className
                        }
                    })
                );
            }
        });

        ws.on('close', () => {
            for (const [email, socket] of clients.entries()) {
                if (socket === ws) {
                    clients.delete(email);
                    break;
                }
            }
        });

        ws.send(JSON.stringify({ type: 'welcome', message: 'WebSocket server ready' }));
    });
};

export const sendToUser = (email: string, message: object) => {
    const client = clients.get(email);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
    }
};
