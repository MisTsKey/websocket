"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const ws_1 = require("ws");
const error_1 = require("./components/error");
//eslint-disable-next-line
class WebSocketManager extends ws_1.EventEmitter {
    constructor(url, websocketOptions) {
        super();
        this.url = url;
        this.resumeSecond = 5;
        this.websocket = void 0;
        this.isReconnect = false;
        this.maxResume = null;
        this.resumeCound = 0;
        if (websocketOptions) {
            typeof websocketOptions.resumeSecond !== "undefined" ? this.resumeSecond = websocketOptions.resumeSecond : void 0;
            typeof websocketOptions.setMaxResume !== "undefined" ? this.maxResume = websocketOptions.setMaxResume : void 0;
        }
        this.run();
    }
    reconnect() {
        this.emit("debug", `[WSManagePackage] Disconnect from Incetance. Retry in ${this.resumeSecond * 1000}ms.`);
        setTimeout(() => {
            if (this.maxResume !== null && this.resumeCound > this.maxResume)
                this.traseLog("WebSocket MaxResumeError", "Retry limit reached.");
            if (this.maxResume !== null)
                this.resumeCound++;
            this.emit("debug", "[WSManagePackage] Retrying....");
            this.resumeSecond = this.resumeSecond * 2;
            this.websocket = void 0;
            this.run();
        }, this.resumeSecond * 1000);
    }
    run() {
        this.websocket = new ws_1.WebSocket(this.url);
        this.websocket.onopen = () => {
            if (!this.isReconnect) {
                this.emit("ready", () => { });
            }
            else {
                this.emit("reconnect", () => { });
            }
        };
        this.websocket.onclose = () => {
            this.emit("disconnect", "Disconnect");
            this.reconnect();
        };
        this.websocket.onerror = (error) => {
            var _a, _b;
            this.emit("disconnect", "Error");
            this.traseLog((_a = error.message) !== null && _a !== void 0 ? _a : "Unknown WebSocket Error", (_b = error.error) !== null && _b !== void 0 ? _b : "Cause from Unknown Error");
        };
        this.websocket.onmessage = (message) => {
            this.emit("message", message);
        };
    }
    send(anyMessage) {
        this.websocket.send(anyMessage);
    }
    traseLog(title, description) {
        throw new error_1.WebSocketManagerError(`${title} \n\n ${description} \n`);
    }
}
exports.WebSocketManager = WebSocketManager;
