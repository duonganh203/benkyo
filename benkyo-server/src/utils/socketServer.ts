import { Server, WebSocket, RawData } from 'ws';
import { Server as HttpServer } from 'http';

const clients = new Map<string, WebSocket>();

type IncomingMessage = {
    type: 'register' | 'invite' | 'schedule-notification';
    email?: string;
    to?: string;
    from?: string;
    className?: string;
    scheduleType?: 'overdue' | 'upcoming';
    deckName?: string;
    deadline?: string;
};

export const setupWebSocket = (server: HttpServer) => {
    const wss = new Server({ server, path: '/ws' });

    wss.on('connection', (ws: WebSocket) => {
        ws.on('message', (msg: RawData) => {
            try {
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

                if (data.type === 'schedule-notification' && data.to && clients.has(data.to)) {
                    const target = clients.get(data.to);
                    target?.send(
                        JSON.stringify({
                            type: 'schedule-notification',
                            payload: {
                                scheduleType: data.scheduleType,
                                deckName: data.deckName,
                                className: data.className,
                                deadline: data.deadline
                            }
                        })
                    );
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
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

        ws.on('error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        ws.send(JSON.stringify({ type: 'welcome', message: 'WebSocket server ready' }));
    });

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });
};

export const sendToUser = (email: string, message: object) => {
    const client = clients.get(email);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
    }
};

export const sendScheduleNotification = (
    email: string,
    scheduleType: 'overdue' | 'upcoming',
    deckName: string,
    className: string,
    deadline: string
) => {
    sendToUser(email, {
        type: 'schedule-notification',
        payload: {
            scheduleType,
            deckName,
            className,
            deadline
        }
    });
};
