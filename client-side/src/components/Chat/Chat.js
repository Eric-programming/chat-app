import React, { useEffect, useState } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import "./Chat-Style.css";

//Components

import InfoBar from "./InfoBar/InfoBar";
import Input from "./Input/Input";
import AllMessages from "./AllMessages/AllMessages";
import TextContainer from "./Textfield/Textfield";

let socketFrontEnd;

const Chat = ({ location, history }) => {
  const ENDPOINT = "https://temp-chat-eric.herokuapp.com/";
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [allMessagesArray, setAllMessagesArray] = useState([]);
  const [users, setUsers] = useState([]);
  const [theme, setTheme] = useState("blue");
  //UseEffects========================
  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    socketFrontEnd = io(ENDPOINT);

    socketFrontEnd.emit("join", { name, room }, error => {
      if (error) {
        alert(error);
        history.push("/");
      }
    });
    setName(name);
    setRoom(room);

    return () => {
      socketFrontEnd.emit("disconnect");
      socketFrontEnd.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socketFrontEnd.on("message", currentMessage => {
      setAllMessagesArray([...allMessagesArray, currentMessage]);
    });
    socketFrontEnd.on("userData", ({ users }) => {
      setUsers(users);
    });
  }, [allMessagesArray]);
  //UseEffects========================

  //Functions================
  const sendMessageFunc = e => {
    e.preventDefault();
    if (currentMessage) {
      socketFrontEnd.emit("sendMessage", currentMessage, () =>
        setCurrentMessage("")
      );
    }
  };
  useEffect(() => {
    if (currentMessage !== "") {
      socketFrontEnd.emit("isTyping", room, true);
    } else {
      socketFrontEnd.emit("isTyping", room, false);
    }
  }, [currentMessage]);
  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} theme={theme} />
        <AllMessages messages={allMessagesArray} name={name} />
        <Input
          message={currentMessage}
          setMessage={setCurrentMessage}
          sendMessage={sendMessageFunc}
          theme={theme}
        />
      </div>
      <TextContainer users={users} name={name} changeColorFunc={setTheme} />
    </div>
  );
};

export default Chat;
