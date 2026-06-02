import LoginBackground from "@/components/login/LoginBackground";
import LoginCard from "@/components/login/LoginCard";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full bg-bg">
      {/* 1. Navbar 깔끔하게 제거! */}
      
      <LoginBackground />
      <div className="relative z-10">
        <LoginCard />
      </div>
    </main>
  );
}