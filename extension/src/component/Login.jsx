import React, { useState } from "react";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await axios.post("http://localhost:5000/api/v1/login", {
        username,
        password,
      });

      if (
        response.status === 200 &&
        response.data.token &&
        response.data.username
      ) {
        chrome.storage.local.set(
          { token: response.data.token, username: response.data.username },
          () => {
            console.log("Token and Username saved successfully.");
            onLogin(response.data.token, response.data.username);
          }
        );
      } else {
        setError(response.data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Network error. Please try again.");
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        padding: 3,
        width: 320,
        textAlign: "center",
        borderRadius: 3,
        background: "rgba(18, 18, 18, 0.9)",
        color: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom>
        🔑 Login
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputLabelProps={{ style: { color: "#ccc" } }}
          InputProps={{ style: { color: "#fff" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#fff",
              },
              "&:hover fieldset": {
                borderColor: "#fff",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#fff",
              },
            },
          }}
        />

        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ style: { color: "#ccc" } }}
          InputProps={{ style: { color: "#fff" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#fff",
              },
              "&:hover fieldset": {
                borderColor: "#fff",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#fff",
              },
            },
          }}
        />

        {error && <Typography color="error">{error}</Typography>}

        <Button variant="contained" color="primary" onClick={handleLogin}>
          🔓 Login
        </Button>
      </Box>
    </Paper>
  );
};

export default Login;
