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

type Message = JoinMessage | ChatMessage

let allSockets: User[] = [];

wss.on("connection", (socket) => {

    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString())

        if(parsedMessage.type == "join"){

            console.log("user joined room: "+ parsedMessage.payload.roomId)

            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId,
                username: parsedMessage.payload.username
            })
        }

        if(parsedMessage.type === "chat"){

            console.log("user wants to chat")
            
            let currentUserRoom = null;
            for(let i=0; i<allSockets.length; i++){
                if(allSockets[i]?.socket == socket){
                    currentUserRoom = allSockets[i]?.room;
                }
            }

            const sender = allSockets.find(user => user.socket === socket)

            for(let i=0; i<allSockets.length; i++){
                if(allSockets[i]?.room === currentUserRoom){
                    allSockets[i]?.socket.send(
                        JSON.stringify({
                            type: "chat",
                            payload: {
                                message: parsedMessage.payload.message,
                                username: sender?.username
                            }
                        })
                    )
                }
            }
        }

    })

})