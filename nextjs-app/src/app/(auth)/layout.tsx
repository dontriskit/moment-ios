import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to app if already logged in
  if (session?.user) {
    redirect("/for-you");
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}