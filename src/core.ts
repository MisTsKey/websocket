
import { MessageEvent, WebSocket } from "ws";
import { WebSocketManagerError } from "./components/error";

//eslint-disable-next-line
export class WebSocketManager {

	private url : string;
	private websocket : WebSocket;
	private resumeSecond : number;
	private isReconnect : boolean;

	constructor(url : string) {

		this.url = url;
		this.resumeSecond = 10;
		this.websocket = void 0;
		this.isReconnect = false;

		this.run();
	}

	private reconnect () {
		this.emit("debug", `Disconnect from Incetance. Retry in ${this.resumeSecond * 1000}Sec.`);

		setTimeout(() => {
			this.resumeSecond = this.resumeSecond * 2;
			this.websocket = new WebSocket(this.url);
		}, this.resumeSecond * 1000);
	}

	private run() {
		this.websocket = new WebSocket(this.url);

		this.websocket.onopen = () => {
			if(!this.isReconnect) {
				this.emit("ready", () => {});
			} else {
				this.emit("reconnect", () => {});
			}
		};

		this.websocket.onclose = () => {
			this.emit("disconnect", "Disconnect");
			this.reconnect();
		};

		this.websocket.onerror = (error) => {
			this.emit("disconnect", "Error");
			this.traseLog(error.message ?? "Unknown WebSocket Error", error.error ?? "Cause from Unknown Error");
		};

		this.websocket.onmessage = (message) => {
			this.emit("message", message);
		};
	}

	private traseLog ( title : string , description : string ) {
		throw new WebSocketManagerError(`${title} \n\n ${description} \n`);
	}
}

//eslint-disable-next-line
export declare interface WebSocketManager {

	on<E extends keyof ClientEvents>(
		event : E,
		listener : (...args : ClientEvents[E]) => void
	): this

	once<E extends keyof ClientEvents>(
		event : E,
		listener : (...args : ClientEvents[E]) => void
	): this

	emit<E extends keyof ClientEvents>(
		event : E,
		...args : ClientEvents[E]
	)

}

export interface ClientEvents {
	debug : [message : string];
	reconnect : [() => void];
	ready : [() => void];
	disconnect : [cause : Cause];
	message : [message : MessageEvent];
}

export type Cause = "Error" | "Disconnect" | "Connect"