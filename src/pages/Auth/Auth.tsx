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
    <div className="auth-container relative">
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
        <div
          className="max-w-[450px] w-full flex flex-col items-center"
          style={{ gap: "clamp(1rem, 5vw, 37px)" }}
        >
          <h1
            className="font-semibold text-white"
            style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }}
          >
            I N T E R L I N K
          </h1>
          <Login />
        </div>
      </div>
      <div className="absolute bottom-0 flex flex-wrap justify-between items-center text-[#FFFFFF73] font-light w-full px-4 sm:px-10 py-5 gap-2 sm:gap-0">
        <p>+992 900 12 36 88</p>
        <p>
          Разработан <span className="font-semibold">Company</span>
        </p>
        <p>Поддержка: example@mail.com</p>
      </div>
    </div>
  );
};
