import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import axios from "axios";

const TourChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const tourData = JSON.parse(
        window.localStorage.getItem("userData") || "{}"
      );
      if (!tourData.token) {
        console.error("Authentication token is missing.");
        return;
      }

      try {
        const chatsResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/chats/tour/${tourData.data.tour._id}`,
          { headers: { Authorization: `Bearer ${tourData.token}` } }
        );
        const allChats = chatsResponse.data.data.chats || [];
        setChats(allChats);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, []);

  const getUserInfo = (chat) => {
    if (!chat || !chat.members || !chat.members.user) {
      return null;
    }
    const { name, email } = chat.members.user;
    return { name, email };
  };

  const handleNavigate = (chatId) => {
    window.location.href = `http://localhost:3001/chat/${chatId}`;
  };

  return (
    <>
      <Nav />
      <div className="tour-chat">
        <h2>Tour Chats</h2>
        {loading ? (
          <p>Loading chats...</p>
        ) : chats.length > 0 ? (
          <div className="chat-grid">
            {chats.map((chat) => {
              const userData = getUserInfo(chat);
              if (!userData) return null;

              return (
                <div key={chat._id} className="chat-block">
                  <div className="chat-header">
                    <div>
                      <h3>{userData.name}</h3>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div className="chat-body">
                    <p>Date: {new Date(chat.createdAt).toLocaleDateString()}</p>
                    <p>Price: 100 L.E</p>
                    <p>Location: Gouna</p>
                  </div>
                  <button
                    onClick={() => handleNavigate(chat._id)}
                    className="navigate-btn"
                  >
                    Go to Chat
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No chats found.</p>
        )}
      </div>
      <Footer name="footer-main" />
    </>
  );
};

export default TourChatPage;
