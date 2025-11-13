import Image from "next/image";

const WS_URL = process.env.SOCKET_URL || "ws://127.0.0.1:8080/ws";

export default function Home() {
  const socket = new WebSocket(WS_URL);
  console.log("Attempting Connection...");

  socket.onopen = () => {
    console.log("Successfully Connected");
    socket.send("Hi From the Client!");
  };

  socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
  };

  socket.onerror = (error) => {
    console.log("Socket Error: ", error);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h2>Hello World front</h2>
      </main>
    </div>
  );
}
