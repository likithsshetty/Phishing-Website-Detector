"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LinkList from "../components/LinkList";
import Navbar from "../components/Navbar";

const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      username: payload.username || "", 
      email: payload.email || "",
      profileImage: payload.profileImage || "",
    };
  } catch (error) {
    return { username: "", email: "", profileImage: "" };
  }
};

export default function Home() {
  const router = useRouter();
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const getToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    }
    return token;
  };

  const fetchLinks = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(backendUrl+"/api/v1/urls", {
        headers: { authToken: token },
      });
      if (!response.ok) {
        setError("Failed to fetch links. Please log in again.");
        router.push("/login");
        return;
      }
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
      setError("An error occurred while fetching links.");
    }
  };

  const toggleStatus = async (url) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        backendUrl+"/api/v1/block-toggle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authToken: token,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      if (response.ok) {
        fetchLinks();
      } else {
        setError("Failed to update link status.");
      }
    } catch (error) {
      console.error("Error updating link status:", error);
      setError("An error occurred while updating the link status.");
    }
  };

  const deleteLink = async (url) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        backendUrl+"/api/v1/delete-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authToken: token,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      if (response.ok) {
        fetchLinks(); // Refresh list after deletion
      } else {
        setError("Failed to delete the URL.");
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      setError("An error occurred while deleting the URL.");
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      const {
        username: decodedUsername,
        email: decodedEmail,
        profileImage: decodeprofileImage,
      } = decodeToken(token);
      setUsername(decodedUsername);
      setEmail(decodedEmail);
      setProfileImage(decodeprofileImage);
    }

    fetchLinks();
    const intervalId = setInterval(fetchLinks, 5000);
    return () => clearInterval(intervalId);
  }, [router]);

  return (
    <main data-theme="dracula" className="flex min-h-screen flex-col items-center justify-between p-6 bg-base-200">
      <div className="flex flex-col items-center justify-center w-full">
        {error && <p className="text-red-500">{error}</p>}
        <div className="w-full max-w-4xl">
          <Navbar username={username} email={email} profileImage={profileImage} />
          <LinkList links={links} toggleStatus={toggleStatus} deleteLink={deleteLink} />
        </div>
      </div>
    </main>
  );
}
