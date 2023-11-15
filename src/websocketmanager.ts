
import { EventEmitter, MessageEvent, WebSocket } from "ws";
import { WebSocketManagerError } from "./components/error";

export interface IWebSocketManagerOptions {
	/**
	 * ## setMaxResult
	 * 
	 * ---
	 * 
	 * Set the resume counts.
	 * 
	 * By the default : `None`
	 * 
	 * If the server is down, reconnecting will be **useless**.
	 * 
	 * Also, since reconnection becomes a considerable load,
	 * 
	 * WebSocketManager will stop the WebSocket if this number of times is exceeded.
	 * 
	 * ---
	 * 
	 * 再試行回数を設定します。
	 * 
	 * デフォルト : `なし`
	 * 
	 * もしインスタンスがダウンしている場合、再接続は**無駄な処理**となってしまいます。
	 * 
	 * なので、負荷防止＆プロセスの軽量化のためにWebSocketManagerはWebSocketをこの回数を越えた場合に
	 * 
	 * 再接続動作を停止します。
	 */
	setMaxResume : number;

	/**
	 * ## resumeScond
	 * 
	 * ---
	 * 
	 * Set the resume secound.
	 * 
	 * By the default : `10`(s)
	 * 
	 * Resume Second will take longer and longer depending on the number of times you retry.
	 * 
	 * ---
	 * 
	 * 再試行する間隔の秒数を定義します。
	 * 
	 * デフォルト : `10`(秒)
	 * 
	 * 再試行する間隔は、再試行する回数に応じてどんどん伸びていきます。
	 */
	resumeSecond : number;
}

//eslint-disable-next-line
export class WebSocketManager extends EventEmitter {

	private url : string | URL ;
	private websocket : WebSocket;
	private resumeSecond : number;
	private isReconnect : boolean;
	private maxResume : number | null;
	private resumeCound : number;

	constructor(url : URL | string , websocketOptions ?: Partial<IWebSocketManagerOptions> ) {
		super();

		this.url = url;
		this.resumeSecond = 5;
		this.websocket = void 0;
		this.isReconnect = false;
		this.maxResume = null;
		this.resumeCound = 0;

		if(websocketOptions) {
			typeof websocketOptions.resumeSecond !== "undefined" ? this.resumeSecond = websocketOptions.resumeSecond : void 0;
			typeof websocketOptions.setMaxResume !== "undefined" ? this.maxResume = websocketOptions.setMaxResume : void 0;
		}

		this.run();
	}

	private reconnect () {
		this.emit("debug", `[WSManagePackage] Disconnect from Incetance. Retry in ${this.resumeSecond * 1000}ms. \n ${this.maxResume}`);

		setTimeout(() => {
			// Retry limit
			if(this.maxResume !== null) this.resumeCound++;
			if(this.maxResume !== null && this.resumeCound === this.maxResume) this.traseLog("WebSocket MaxResumeError", "Retry limit reached.");

			this.emit("debug", "[WSManagePackage] Retrying....");

			this.resumeSecond = this.resumeSecond * 2;
			this.websocket = void 0;
			this.run();
		}, this.resumeSecond * 1000);
	}

	private run() {
		this.websocket = new WebSocket(this.url);

		this.emit("debug", `[WSManagePackage] \n InitURL : ${this.url} \n IsReconnect : ${this.isReconnect} (by the default : false) \n maxResume : ${this.maxResume ?? "None"} \n Resumed : ${this.resumeCound} (by the default  : 0)`);

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

	send( anyMessage : BufferLike ) : void {
		this.websocket.send(anyMessage);
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

export type BufferLike =
    | string
    | Buffer
    | DataView
    | number
    | ArrayBufferView
    | Uint8Array
    | ArrayBuffer
    | SharedArrayBuffer
	//eslint-disable-next-line
    | ReadonlyArray<any>
    | ReadonlyArray<number>
    | { valueOf(): ArrayBuffer }
    | { valueOf(): SharedArrayBuffer }
    | { valueOf(): Uint8Array }
    | { valueOf(): ReadonlyArray<number> }
    | { valueOf(): string }
    | { [Symbol.toPrimitive](hint: string): string };