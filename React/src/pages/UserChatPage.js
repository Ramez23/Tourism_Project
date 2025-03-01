import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import axios from "axios";

const UserChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const userData = JSON.parse(
        window.localStorage.getItem("userData") || "{}"
      );
      if (!userData.token) {
        console.error("Authentication token is missing.");
        return;
      }
      console.log(userData);
      try {
        const chatsResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/chats/user/${userData.data.user._id}`,
          { headers: { Authorization: `Bearer ${userData.token}` } }
        );
        const allChats = chatsResponse.data.data.chats || [];
        setChats(allChats);
        console.log(allChats);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, []);

  const getTourInfo = (chat) => {
    if (!chat || !chat.members || !chat.members.tour) {
      return null;
    }
    const { name, email } = chat.members.tour;
    return { name, email };
  };
  const handleNavigate = (chatId) => {
    window.location.href = `http://localhost:3001/chat/${chatId}`;
  };

  return (
    <>
      <Nav />
      <div className="user-chat">
        <h2>User Chats</h2>
        {loading ? (
          <p>Loading chats...</p>
        ) : chats.length > 0 ? (
          <div className="chat-grid">
            {chats.map((chat) => {
              const tourInfo = getTourInfo(chat);
              if (!tourInfo) return null;

              return (
                <div key={chat._id} className="chat-block">
                  <div className="chat-header">
                    <div>
                      <h3>{tourInfo.name}</h3>
                      <p>{tourInfo.email}</p>
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

export default UserChatPage;
