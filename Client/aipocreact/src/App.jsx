import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const websocket = useRef(null);

  useEffect(() => {
    const url = "ws://127.0.0.1:8000/ws";
    websocket.current = new WebSocket(url);

    websocket.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    websocket.current.onmessage = (e) => {
      const receivedMessage = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    };

    websocket.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    websocket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      websocket.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(message);
      setMessage("");
    } else {
      console.error("WebSocket is not open");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>React Js + FastAPI- Open ai POC</h2>
      <h4 style={styles.subHeader}>Simple Q&A Chatbot </h4>
      <div style={styles.chatContainer}>
        <div style={styles.chat}>
          {messages.map((value, index) => (
            <div
              key={index}
              style={
                value.role === "user"
                  ? styles.myMessageContainer
                  : styles.anotherMessageContainer
              }
            >
              <div
                style={
                  value.role === "user" ? styles.myMessage : styles.anotherMessage
                }
              >
                <ReactMarkdown>{value.message}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.inputChatContainer}>
          <input
            style={styles.inputChat}
            type="text"
            placeholder="Chat message ..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          <button style={styles.submitChat} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "60vw",
    margin: "0 auto",
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    textAlign: "center",
  },
  subHeader: {
    textAlign: "center",
    // color: "#555",
  },
  chatContainer: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
  },
  chat: {
    height: "60vh",
    overflowY: "scroll",
    marginBottom: "10px",
  },
  myMessageContainer: {
    textAlign: "right",
    marginBottom: "10px",
  },
  anotherMessageContainer: {
    textAlign: "left",
    marginBottom: "10px",
  },
  myMessage: {
    display: "inline-block",
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "#d3d3d3",
    color: "black",
    maxWidth: "70%",
    wordWrap: "break-word",
  },
  anotherMessage: {
    display: "inline-block",
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "#e0e2ff",
    color: "black",
    maxWidth: "70%",
    wordWrap: "break-word",
  },
  inputChatContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  inputChat: {
    flex: "1",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor:"white",
    color:"black",
    border: "1px solid #ccc",
    marginRight: "10px",  
  },
  submitChat: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default App;
