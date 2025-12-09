import { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";

const SPACE_VIDEOS = [
    "https://videos.pexels.com/video-files/3129957/3129957-sd_640_360_25fps.mp4",
    "https://videos.pexels.com/video-files/4133023/4133023-sd_640_360_30fps.mp4",
];

export const AuthLayout = () => {
    const [videoIndex, setVideoIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setVideoIndex((prev) => (prev + 1) % SPACE_VIDEOS.length);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="auth-container">
            <div className="auth-video-bg">
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
            <div className="auth-content">
                <LoginForm />
            </div>
        </div>
    );
};
