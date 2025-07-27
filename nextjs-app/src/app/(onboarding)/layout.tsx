import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // If onboarding is already completed, redirect to app
  if (session.user && 'onboardingCompleted' in session.user && session.user.onboardingCompleted) {
    redirect("/for-you");
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}