# MisTsKey Websocket Manager

安定性を兼ね備えたWebSocketマネージャー for MisTsKey

## How to use

```ts

import { WebSocketManager } from "path/to/manager";

const ws = new WebSocketManager("wss://example.com");

ws.on('ready', () => {
    console.log('Ready!')
})

ws.on('message', (message) => {
    console.log('message from Server!')
})

ws.on('disconnect', (cause) => {
    console.log(`disconnected by server! Cause : ${cause}`)
})

ws.on('reconnect', () => {
    console.log('Reconnected!')
})

ws.on('debug' , (log) => {
    console.log(log)
})

```

## Licence

(c) akikaki 2023

MIT