import { Login } from "@features/Login";

export const Auth = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617] font-sans selection:bg-blue-500/30">
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 w-full h-full">
          <video
            className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover"
            src="/videos/bg-auth-video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617]/50 to-[#020617]" />

        {/* Animated Glow Effects */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold tracking-tight text-white uppercase">
            I N T E R L I N K
          </h1>
        </div>

        {/* Form Feature */}
        <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <Login />
        </div>
      </div>
    </div>
  );
};
