export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] px-4 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      {/* Ambient glow */}
      <div className="absolute top-[-30%] left-[20%] w-[600px] h-[600px] bg-[#00FF87]/[0.02] rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-[#00D4FF]/[0.015] rounded-full blur-[150px]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
