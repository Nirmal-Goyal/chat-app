import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080})

interface User {
    socket: WebSocket;
    room: string;
    username: string;
}

interface JoinMessage {
    type: "join";
    payload: {
        roomId: string;
        username: string;
    };
}

interface ChatMessage {
    type: "chat";
    payload: {
        message: string;
    }
}

type Message = JoinMessage | ChatMessage;

let allSockets: User[] = [];

wss.on("connection", (socket) => {

    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString())

        //JOIN ROOM
        if(parsedMessage.type == "join"){

            console.log("user joined room: "+ parsedMessage.payload.roomId)

            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId,
                username: parsedMessage.payload.username
            })
        }

        //CHAT MESSAGE
        if(parsedMessage.type === "chat"){

            const sender = allSockets.find(user => user.socket === socket)
            if(!sender) return;

            const room = sender.room;

            for(const user of allSockets) {
                if(user.room === room){
                    user.socket.send(JSON.stringify({
                        type: "chat",
                        payload: {
                            message: parsedMessage.payload.message,
                            username: sender.username
                        }
                    }))
                }
            }
        }

    })

    socket.on("close", () => {
        console.log("user disconnected");

        allSockets = allSockets.filter(user => user.socket !== socket)
    })

})