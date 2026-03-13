import { useEffect, useRef, useState } from "react"

function App() {

  interface ChatMessage {
    message: string;
    username: string;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if(data.type === "chat"){
        setMessages((m) => [...m, data.payload])
      }
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        payload: {
          roomId: "red",
          username: "Nirmal"
        }
      }))
    }

    wsRef.current = ws;

  }, []);

  const sendMessage = () => {
    if(!wsRef.current) return

    wsRef.current.send(JSON.stringify({
      type: "chat",
      payload: {
        message: input
      }
    }))

    setInput("")
  }
  
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl h-[90vh] flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-lg">
        
        <div className="flex-1 bg-green-300 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="bg-white text-black rounded p-4 m-2">
              {msg.username}: {msg.message}
            </div>
          ))}
        </div>

        <div className="bg-white flex items-center gap-2 p-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-md border outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={sendMessage} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md transition">
            Send
          </button>
        </div>

      </div>
    </div>
  )
}

export default App