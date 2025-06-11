import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  AppBar,
  Toolbar,
  Divider,
  Switch,
  Link,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";

const Popup = () => {
  const [url, setUrl] = useState("");
  const [isSafe, setIsSafe] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("Guest");
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["token", "username", "autoScanEnabled"], (result) => {
      setToken(result.token || "");
      setUsername(result.username || "Guest");
      setAutoScanEnabled(result.autoScanEnabled || false);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) setUrl(tabs[0].url);
    });
  }, []);

  useEffect(() => {
    if (!autoScanEnabled || !token || !url) return;

    setError("");
    const interval = setInterval(async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/check",
          { url },
          { headers: { authToken: token } }
        );
        const { is_safe, is_blocked } = response.data;
        setIsSafe(is_safe);
        setIsBlocked(is_blocked);
        setError("");

        if (is_blocked) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
              chrome.tabs.update(tabs[0].id, { url: "https://www.google.com" });
            }
          });
        }
      } catch (err) {
        console.error("Auto scan error:", err);
        setError("Auto scan stopped due to server error.");
        setAutoScanEnabled(false);
        chrome.storage.local.set({ autoScanEnabled: false });
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScanEnabled, token, url]);

  const handleScan = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/check",
        { url },
        { headers: { authToken: token } }
      );

      const { is_safe, is_blocked } = response.data;
      setIsSafe(is_safe);
      setIsBlocked(is_blocked);
      setError("");

      if (is_blocked) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { url: "https://www.google.com" });
          }
        });
      }
    } catch (err) {
      console.error("Error scanning URL:", err);
      setError("Error scanning URL. Please try again.");
      setIsSafe(null);
      setIsBlocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    chrome.storage.local.remove(["token", "username", "autoScanEnabled"], () => {
      window.location.reload();
    });
  };

  const handleToggleAutoScan = (event) => {
    const enabled = event.target.checked;
    setAutoScanEnabled(enabled);
    setError("");
    chrome.storage.local.set({ autoScanEnabled: enabled });
  };

  const openManageLink = () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  };

  return (
    <Paper
      elevation={6}
      sx={{
        padding: 0,
        width: 340,
        borderRadius: 4,
        overflow: "hidden",
        background: "rgba(18, 18, 18, 0.85)",
        color: "#fff",
        backdropFilter: "blur(12px)",
        mb: 0,
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          background: "rgba(30,30,30,0.7)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">🔍 Phishing Detector</Typography>
          <Typography variant="body2">👤 {username}</Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box
        sx={{
          pt: 3,
          px: 3,
          pb: 0,
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>URL:</strong> {url || "Loading..."}
        </Typography>

        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />

        <Typography variant="body2">
          <strong>Is Safe:</strong>{" "}
          {isSafe === null
            ? "Unknown"
            : isSafe
            ? "✅ Yes"
            : "❌ No (Potential threat)"}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Is Blocked:</strong> {isBlocked ? "🚫 Blocked (Redirected)" : "✅ Allowed"}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress color="primary" size={24} />
          </Box>
        ) : (
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: 3,
              mt: 1,
              color: error ? "error.main" : "inherit",
              bgcolor: error ? "rgba(255,0,0,0.15)" : "primary.main",
              "&:hover": {
                bgcolor: error ? "rgba(255,0,0,0.25)" : "primary.dark",
              },
            }}
            onClick={handleScan}
          >
            {error ? error : "🔍 Scan URL"}
          </Button>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            pt: 1,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            mb: 0,
            pb: 0,
            fontSize: "0.875rem",
          }}
        >
          <Link
            component="button"
            underline="hover"
            onClick={openManageLink}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "inherit",
              fontSize: "inherit",
              p: 0,
              cursor: "pointer",
            }}
          >
            Manage <OpenInNewIcon fontSize="small" />
          </Link>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "inherit" }}>Auto Scan</Typography>
            <Switch
              checked={autoScanEnabled}
              onChange={handleToggleAutoScan}
              color="primary"
              size="small"
              disabled={loading}
            />
          </Box>
        </Box>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{ borderRadius: 3, mt: 3, mb: 2 }}
          onClick={handleLogout}
        >
          🚪 Logout
        </Button>
      </Box>
    </Paper>
  );
};

export default Popup;
