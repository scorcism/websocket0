import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('ws://localhost:8080', { path: "/wc" });

function App() {
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prevMessages) => [...prevMessages, { message: `User ${data.userId} joined the room` }]);
    });

    socket.on('user_left', (data) => {
      setMessages((prevMessages) => [...prevMessages, { message: `User ${data.userId} left the room` }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, []);

  const joinRoom = () => {
    if (roomId !== '') {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = () => {
    if (roomId !== '') {
      socket.emit('leave_room', roomId);
      setRoomId('');
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (message !== '' && roomId !== '') {
      socket.emit('send_message', { roomId, message });
      setMessage('');
    }
  };

  return (
    <div>
      {message}
      <div>
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
        <button onClick={leaveRoom}>Leave Room</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h2>Messages:</h2>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.userId ? `${msg.userId}: ${msg.message}` : msg.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;