import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { BottomNavbar } from "@/components/app/BottomNavbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Temporarily skip onboarding check to test the app
  // TODO: Re-enable once onboarding flow is fixed
  // if (session.user && 'onboardingCompleted' in session.user && !session.user.onboardingCompleted) {
  //   redirect("/onboarding/quiz");
  // }

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNavbar />
    </div>
  );
}