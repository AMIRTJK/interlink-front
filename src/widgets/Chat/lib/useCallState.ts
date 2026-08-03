import { useEffect, useState } from "react";

/**
 * Состояние звонка.
 *
 * Звонки и ВКС в текущую версию бэкенда не входят: экран звонка остаётся
 * локальной демонстрацией интерфейса и никаких запросов не делает. Вынесен
 * отдельно, чтобы при появлении API его можно было заменить целиком.
 */
export const useCallState = () => {
  const [callState, setCallState] = useState<"none" | "audio" | "video">("none");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<{
    callType: "audio" | "video";
  } | null>(null);

  useEffect(() => {
    if (callState === "none") return;
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    setCallState(incomingCall.callType);
    setIncomingCall(null);
  };

  const handleDeclineCall = () => setIncomingCall(null);

  const handleEndCall = () => {
    setCallState("none");
    setIsMuted(false);
    setIsVideoOff(false);
    // Счётчик обнуляем здесь, чтобы следующий звонок начинался с нуля.
    setCallDuration(0);
  };

  return {
    callState,
    setCallState,
    isMuted,
    setIsMuted,
    isVideoOff,
    setIsVideoOff,
    callDuration,
    incomingCall,
    setIncomingCall,
    handleAcceptCall,
    handleDeclineCall,
    handleEndCall,
  };
};
