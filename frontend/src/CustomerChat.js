import React, { useEffect } from 'react';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window, } from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

function CustomerChat({ channel, firstName, lastName, email, chatClient }) {
    useEffect(() => {
        const handleUnload = (event) => {
            event.preventDefault();
            fetch('http://localhost:8080/email-transcript', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: channel.state.messages,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    createdAt: channel.data.config.created_at
                })
            });
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [channel, firstName, lastName, email]
    );

    return (
        <div className="App">
            <Chat client={chatClient} theme={'messaging light'}>
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
}
export default CustomerChat;