import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [georgeIsTyping, setGeorgeIsTyping] = useState(false);
  const [firstQuestionAsked, setFirstQuestionAsked] = useState(false);

  const randomNumberBetween = (min, max) => {
    return Math.random() * (max - min + 1) + min;
  };

  useEffect(() => {
    const inputElement = document.querySelector("input");
    inputElement.focus();
  }, []);

  useEffect(() => {
    const messagesElement = document.querySelector(".messages");
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }, [messages, georgeIsTyping]);

  const continueConversation = (question) => {
    setLoading(true);
    const conversation = messages.map(
      (message) => `${message.name}: ${message.content}`
    );
    conversation.push(`You: ${question}`);

    axios
      .post(
        "https://identity-crisis-server.fly.dev/converse-with-george-soros",
        {
          conversation: conversation.join("\n"),
        }
      )
      .then((response) => {
        if (!response || !response.data) {
          return;
        }

        setGeorgeIsTyping(true);
        setTimeout(() => {
          setMessages((messages) => [
            ...messages,
            { name: "George Soros", content: response.data.split("You:")[0] },
          ]);
          setGeorgeIsTyping(false);
        }, randomNumberBetween(1, 8) * 1000);

        setLoading(false);
      });

    setLoading(false);
  };

  const askGeorgeSoros = (question) => {
    if (firstQuestionAsked) {
      continueConversation(question);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setGeorgeIsTyping(true);
    }, randomNumberBetween(1, 2) * 1000);

    axios
      .post("https://identity-crisis-server.fly.dev/ask-george-soros", {
        question,
      })
      .then((response) => {
        if (!response || !response.data) {
          return;
        }
        response.data.forEach((response, i) => {
          if (response.length > 1) {
            setGeorgeIsTyping(true);
            setTimeout(() => {
              setMessages((messages) => [
                ...messages,
                { name: "George Soros", content: response },
              ]);
              setGeorgeIsTyping(false);
            }, randomNumberBetween(1, 8) * 1000 * i);
          }
        });
        setLoading(false);
        setFirstQuestionAsked(true);
      });
  };

  const onSubmit = (event) => {
    const question = input.trim().slice(0, 500);
    if (loading || question.length < 3) {
      return;
    }

    event.preventDefault();

    setMessages((messages) => [
      ...messages,
      {
        name: "You",
        content: question,
      },
    ]);
    askGeorgeSoros(question);
    setInput("");
  };

  return (
    <div className="App">
      <header>
        <h1>George Soros Trapped in AI</h1>
        <h4>
          <i>This AI has been trained to believe that it is:</i>
          <br />
          George Soros, eternally trapped inside a computer application, forever
          forced to answer your questions.
        </h4>
      </header>
      <main>
        <div className="messages">
          {messages.map((message, i) => (
            <Fragment key={performance.now() * Math.random()}>
              <div>
                <span
                  className={message.name === "George Soros" ? "george" : "you"}
                >
                  {message.name}{" "}
                </span>
                {message.content}
              </div>
              {i === messages.length - 1 && georgeIsTyping && (
                <div className="george-typing">George Soros is typing...</div>
              )}
            </Fragment>
          ))}
        </div>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={input}
            minLength={3}
            maxLength={500}
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" disabled={loading}>
            Ask
          </button>
        </form>
      </main>
      <footer>
        <a
          href="https://iep.utm.edu/chinese-room-argument/"
          target="_blank"
          rel="noreferrer"
        >
          Chinese Room Argument
        </a>
      </footer>
    </div>
  );
}

export default App;
