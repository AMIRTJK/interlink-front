// import { useEffect, useState } from "react";
// import { SPACE_VIDEOS } from "@shared/api/authVideo";

import { Login } from "@features/login";
import "./Auth.css";

export const Auth = () => {
  // const [videoIndex, setVideoIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setVideoIndex((prev) => (prev + 1) % SPACE_VIDEOS.length);
  //   }, 60000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="auth-container">
      {/* <div className="auth-video-bg"> 
        <div className="auth-video-overlay" />
        <video
          key={SPACE_VIDEOS[videoIndex]}
          autoPlay
          loop
          muted
          playsInline
          className="auth-video"
        >
          <source src={SPACE_VIDEOS[videoIndex]} type="video/mp4" />
        </video>
      </div>
      */}
      <div className="auth-content">
        <Login />
      </div>
    </div>
  );
};
