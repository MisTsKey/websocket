import { MessageEvent } from "ws";
export declare class WebSocketManager {
    private url;
    private websocket;
    private resumeSecond;
    private isReconnect;
    constructor(url: string);
    private reconnect;
    private run;
    private traseLog;
}
export declare interface WebSocketManager {
    on<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => void): this;
    once<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => void): this;
    emit<E extends keyof ClientEvents>(event: E, ...args: ClientEvents[E]): any;
}
export interface ClientEvents {
    debug: [message: string];
    reconnect: [() => void];
    ready: [() => void];
    disconnect: [cause: Cause];
    message: [message: MessageEvent];
}
export type Cause = "Error" | "Disconnect" | "Connect";
