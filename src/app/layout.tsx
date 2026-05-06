import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NotificationBadge } from "@/app/_components/NotificationBadge";
import { auth, signOut } from "@/auth";
import { Taskbar } from "@/app/_components/Taskbar";
import { ClippyProvider } from "@/app/_components/ClippyProvider";
import { ClippyButton } from "@/app/_components/ClippyButton";
import { ClippyWidget } from "@/app/_components/ClippyWidget";
import {
  WindowStateProvider,
  WindowBody,
  MinimizeButton,
} from "@/app/_components/WindowStateContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paramedic Learnings",
  description:
    "A knowledge platform for ambulance personnel: capture and improve operational guidance with AI-assisted analysis and human approval.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full flex flex-col items-center p-4 pb-10"
        style={{
          background: "#008080",
          backgroundImage:
            "repeating-conic-gradient(#007070 0% 25%, #008080 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      >
        <WindowStateProvider>
          <WindowBody>
            <div
              className="win-raised-outer w-full max-w-5xl flex flex-col"
              style={{ minHeight: "calc(100vh - 3.5rem)" }}
            >
              <ClippyProvider>
                <div className="win-raised flex flex-col flex-1" style={{ background: "#c0c0c0", position: "relative" }}>
                <div className="win-titlebar">
                  <div className="flex items-center gap-1">
                    <MinimizeButton />
                    <span>Paramedic Learnings</span>
                  </div>
                  <div className="flex gap-0.5">
                    <div className="win-titlebar-btn">▼</div>
                    <div className="win-titlebar-btn">▲</div>
                  </div>
                </div>

                <nav className="win-menubar">
                  <Link href="/" className="win-menu-item">
                    <u>T</u>opics
                  </Link>
                  <Link href="/topics/new" className="win-menu-item">
                    <u>N</u>ew Topic
                  </Link>
                  <Link href="/sources" className="win-menu-item">
                    <u>S</u>ources
                  </Link>
                  <Link href="/sources/new" className="win-menu-item">
                    Submit Source
                  </Link>
                  <Link href="/notifications" className="win-menu-item">
                    Notifications
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/login" });
                    }}
                    style={{ marginLeft: "auto" }}
                  >
                    <button type="submit" className="win-menu-item">
                      Sign Out
                    </button>
                  </form>
                </nav>

                <main className="flex-1 p-3 overflow-auto" style={{ background: "#c0c0c0" }}>
                  {children}
                </main>

                <ClippyWidget />

                <footer className="win-statusbar">
                  <span className="win-status-panel" style={{ flex: 1 }}>
                    {session?.user?.name ? `Signed in as ${session.user.name}` : "Ready"}
                  </span>
                  <Suspense fallback={null}>
                    <NotificationBadge />
                  </Suspense>
                  <ClippyButton />
                  <span className="win-status-panel">Paramedic Learnings v1.0</span>
                </footer>
                </div>
              </ClippyProvider>
            </div>
          </WindowBody>
          <Taskbar />
        </WindowStateProvider>
      </body>
    </html>
  );
}
