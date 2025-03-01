import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { TourContext } from "../context/TourContext";

const Chat = ({ chatId }) => {
  const { user } = useContext(UserContext);
  const { tour } = useContext(TourContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Determine active participant and their ID
  const activeParticipant = user || tour;
  const participantId =
    activeParticipant?.data?.user?._id || activeParticipant?.data?.tour?._id;
  const participantName =
    activeParticipant?.data?.user?.name || activeParticipant?.data?.tour?.name;

  useEffect(() => {
    if (!participantId) {
      console.log("No active participant ID found, checking localStorage...");
      const storedData = JSON.parse(window.localStorage.getItem("userData"));
      console.log("Stored Data:", storedData);
    } else {
      console.log("Participant ID:", participantId);
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/messages/${chatId}`
        );
        setMessages(response.data.data.messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [chatId, participantId]);
  console.log(chatId);
  const handleSendMessage = async () => {
    if (!participantId) {
      console.error("No active participant ID available for sending messages.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/messages`, {
        chatId,
        senderId: participantId,
        text: newMessage,
      });
      setMessages([
        ...messages,
        { text: newMessage, sender: { name: activeParticipant.name } },
      ]);
      setNewMessage(""); // Clear the input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <h3>Chat As {activeParticipant ? participantName : "Unknown"}</h3>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{`${msg.sender.name}: ${msg.text}`}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
};

export default Chat;
