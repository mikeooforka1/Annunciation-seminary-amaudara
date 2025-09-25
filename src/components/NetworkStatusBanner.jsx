import React, { useEffect, useState } from "react";
import { MdNetworkWifi3Bar } from "react-icons/md";

const NetworkStatusBanner = () => {
  const [status, setStatus] = useState("online"); // online, offline, restored
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setStatus("restored");
      setShowBanner(true);
    };
    const handleOffline = () => {
      setStatus("offline");
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Only detect offline, not slow
    const pingInterval = setInterval(() => {
      fetch(window.location.origin, { method: "HEAD" })
        .catch(() => {
          setStatus("offline");
          setShowBanner(true);
        });
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pingInterval);
    };
  }, []);

  useEffect(() => {
    if (status === "restored") {
      setShowBanner(true);
    }
    if (status === "online") {
      setShowBanner(false);
    }
    if (status === "restored") {
      const timer = setTimeout(() => setShowBanner(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!showBanner || status === "online") return null;

  let color = "bg-green-100 text-green-800 border-green-300";
  let message = "Network restored";
  let iconColor = "text-green-500";
  let showClose = false;

  if (status === "offline") {
    color = "bg-red-100 text-red-800 border-red-300";
    message = "No connection";
    iconColor = "text-red-500";
  }
  if (status === "restored") {
    color = "bg-green-100 text-green-800 border-green-300";
    message = "Network restored";
    iconColor = "text-green-500";
    showClose = true;
  }

  return (
    <div
      className={`fixed top-2 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto border ${color} rounded-full px-4 py-1 text-xs flex items-center justify-center shadow transition-all`}
      style={{
        fontFamily: 'Inter, Arial, sans-serif',
        maxWidth: '90vw',
        width: 'auto',
      }}
    >
      <span className={`mr-2 flex items-center justify-center`}>
        <MdNetworkWifi3Bar className={`text-base sm:text-lg ${iconColor}`} />
      </span>
      <span className="font-medium truncate">{message}</span>
      {showClose && (
        <button
          className="ml-3 text-lg font-bold text-green-700 hover:text-green-900 focus:outline-none"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => setShowBanner(false)}
          aria-label="Close network banner"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default NetworkStatusBanner;