"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

export default function Navbar({ username, profileImage, email }) {
  const router = useRouter();

  const [url, setUrl] = useState("");

  // Separate state for each modal
  const [checkUrlStatus, setCheckUrlStatus] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const getToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) router.push("/login");
    return token;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const deleteAccount = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(backendUrl + "/api/v1/delete-account", {
        method: "POST",
        headers: {
          Authorization: token,
          authToken: token,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        alert("Account deleted successfully.");
        logout();
      } else {
        alert("Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const checkUrl = async (e) => {
    e.preventDefault();
    setCheckLoading(true);
    setCheckUrlStatus(null);

    try {
      const res = await axios.post(
        backendUrl +"/api/v1/check",
        { url },
        {
          headers: {
            Authorization: getToken(),
            authToken: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      setCheckUrlStatus(res.data.is_safe ? "✅ Safe" : "⚠️ Unsafe");
      console.log("Check result:", res.data);
    } catch (err) {
      console.error("Check error:", err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setCheckUrlStatus("❌ Error checking URL");
      }
    } finally {
      setCheckLoading(false);
    }
  };

  const closeModal = () => {
    document.getElementById("my_modal_5")?.close();
    document.getElementById("profile-model")?.close();
    setUrl("");
    setCheckUrlStatus(null);
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <span className="btn btn-ghost text-xl">Phish Detector</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn btn-neutral btn-sm"
          onClick={() => document.getElementById("my_modal_5").showModal()}
        >
          URL Check
        </button>

        <a
          href="/extension.zip"
          download
          target="_blank"
          className="btn btn-primary btn-sm"
        >
          Download
        </a>

        {/* Avatar/Profile */}
        <div
          className="btn btn-ghost btn-circle avatar"
          onClick={() => document.getElementById("profile-model").showModal()}
        >
          <div className="w-10 rounded-full">
            <img
              src={
                profileImage ||
                "https://static.vecteezy.com/system/resources/previews/018/765/757/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg"
              }
              alt="profile"
            />
          </div>
        </div>
      </div>

      {/* URL Check Modal */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <form className="modal-box" onSubmit={checkUrl}>
          <h3 className="font-bold text-lg mb-2">Check a URL</h3>

          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          {checkUrlStatus && (
            <p className="mt-3 font-semibold text-center">{checkUrlStatus}</p>
          )}

          <div className="modal-action">
            <button type="submit" className="btn btn-primary" disabled={checkLoading}>
              {checkLoading ? "Checking..." : "Check"}
            </button>
            <button type="button" className="btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </form>
      </dialog>

      {/* Profile Modal */}
      <dialog id="profile-model" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Profile</h3>

          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-20 rounded-full">
                <img
                  src={
                    profileImage ||
                    "https://static.vecteezy.com/system/resources/previews/018/765/757/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg"
                  }
                  alt="profile"
                />
              </div>
            </div>
            <div>
              <p className="font-semibold">{username || "User"}</p>
              <p className="text-sm text-gray-400">{email || "someone@example.com"}</p>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-error"
              onClick={() => {
                if (confirm("Are you sure you want to delete your account?")) {
                  deleteAccount();
                }
              }}
            >
              Delete Account
            </button>
            <button type="button" className="btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
