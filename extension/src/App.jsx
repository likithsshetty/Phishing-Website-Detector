import React, { useState, useEffect } from "react";
import Popup from "./component/Popup";
import Login from "./component/Login";
import { CircularProgress, Box } from "@mui/material";

const App = () => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(["token", "username"], (result) => {
      setToken(result.token || null);
      setUsername(result.username || null);
      setLoading(false);
    });
  }, []);

  const handleLogin = (newToken, newUsername) => {
    chrome.storage.local.set(
      { token: newToken, username: newUsername },
      () => {
        setToken(newToken);
        setUsername(newUsername);
      }
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: 320,
          height: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(18, 18, 18, 0.9)",
          color: "#fff",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <div>{token ? <Popup /> : <Login onLogin={handleLogin} />}</div>;
};

export default App;
