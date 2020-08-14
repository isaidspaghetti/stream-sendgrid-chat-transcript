import React, { useState } from 'react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/index.css';
import CustomerChat from './CustomerChat';

function App() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  const register = async (e) => {
    try {
      e.preventDefault();

      const response = await fetch('http://localhost:8080/customer-login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      });

      const { customerId, customerToken, channelId, streamApiKey } = await response.json();
      const chatClient = new StreamChat(streamApiKey);

      await chatClient.setUser(
        {
          id: customerId,
          name: firstName,
        },
        customerToken,
      );

      const channel = chatClient.channel('messaging', channelId);

      setChatClient(chatClient);
      setChannel(channel);

    } catch (e) {
      console.error(e);
    }
  };

  if (chatClient && channel) {
    return (
      <CustomerChat
        channel={channel}
        chatClient={chatClient}
        firstName={firstName}
        lastName={lastName}
        email={email}
      />);
  } else {
    return (
      <div className="App container">
        <form className="card" onSubmit={register}>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="first name"
            required
          />
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="last name"
            required
          />
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            required
          />
          <button type="submit">
            Start chat
          </button>
        </form>
      </div>
    );
  }
}

export default App;
