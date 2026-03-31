import Layout from "@/components/app/Layout";
import Chat from "@/components/app/chat/Chat";
import { useEffect, useState } from "react";
import { IMessage } from "react-native-gifted-chat";

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
      {
        _id: 2,
        text: "My message",
        createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://facebook.github.io/react/img/logo_og.png",
        },
        image: "https://facebook.github.io/react/img/logo_og.png",
        // Mark the message as sent, using one tick
        sent: true,
        // Mark the message as received, using two tick
        received: true,
        // Mark the message as pending with a clock loader
        pending: true,
        // Any additional custom parameters are passed through
      },
      {
        _id: 3,
        text: "My message",
        createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://facebook.github.io/react/img/logo_og.png",
        },
        image: "https://facebook.github.io/react/img/logo_og.png",
        // You can also add a video prop:
        video:
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        // Mark the message as sent, using one tick
        sent: true,
        // Mark the message as received, using two tick
        received: true,
        // Mark the message as pending with a clock loader
        pending: true,
        // Any additional custom parameters are passed through
      },
    ]);
  }, []);

  return (
    <Layout title="Chat" showBack style={{ paddingBottom: 0 }}>
      <Chat messages={messages} />
    </Layout>
  );
};

export default ChatScreen;
