import Navbar from "@/components/shared/Navbar";
import LoginCard from "@/components/login/LoginCard";
import LoginBackground from "@/components/login/LoginBackground";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-bg">
      <LoginBackground />
      <div className="relative z-10">
        <Navbar variant="auth" />
        <LoginCard />
      </div>
    </main>
  );
}