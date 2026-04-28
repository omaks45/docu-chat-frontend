"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

const NAV_ITEMS = [
    {
        href: "/dashboard",
        label: "Overview",
        icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        ),
    },
    {
        href: "/documents",
        label: "Documents",
        icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2"/>
            <path d="M9 4h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z"/>
        </svg>
        ),
    },
    {
        href: "/conversations",
        label: "Conversations",
        icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        ),
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
        router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
        <div
            style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-primary)",
            }}
        >
            <span className="spinner" style={{ width: "24px", height: "24px" }} />
        </div>
        );
    }

    if (!isAuthenticated) return null;

    const handleLogout = async () => {
        await logout();
        toast.success("Signed out");
        router.push("/login");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
        {/* Sidebar */}
        <aside
            style={{
            width: "220px",
            flexShrink: 0,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--bg-border)",
            display: "flex",
            flexDirection: "column",
            padding: "20px 12px",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 10,
            }}
        >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px", marginBottom: "28px" }}>
            <div
                style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "var(--accent-muted)",
                border: "1px solid var(--accent-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round"/>
                <path d="M9 4h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" stroke="var(--accent)" strokeWidth="1.75"/>
                </svg>
            </div>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                DocuChat
            </span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1 }}>
            <p style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: "6px" }}>
                Menu
            </p>
            {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                <Link
                    key={item.href}
                    href={item.href}
                    style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 10px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "2px",
                    textDecoration: "none",
                    fontSize: "13.5px",
                    fontWeight: active ? "500" : "400",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    background: active ? "var(--bg-elevated)" : "transparent",
                    border: active ? "1px solid var(--bg-border)" : "1px solid transparent",
                    transition: "all 0.15s",
                    }}
                >
                    <span style={{ color: active ? "var(--accent)" : "inherit", flexShrink: 0 }}>
                    {item.icon}
                    </span>
                    {item.label}
                </Link>
                );
            })}
            </nav>

            {/* User footer */}
            <div
            style={{
                borderTop: "1px solid var(--bg-border)",
                paddingTop: "16px",
                marginTop: "16px",
            }}
            >
            <div style={{ padding: "0 8px", marginBottom: "8px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
                </p>
                <span
                style={{
                    display: "inline-block",
                    fontSize: "10px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--accent)",
                    background: "var(--accent-muted)",
                    border: "1px solid var(--accent-border)",
                    borderRadius: "4px",
                    padding: "1px 6px",
                    marginTop: "3px",
                }}
                >
                {user?.tier ?? "free"}
                </span>
            </div>
            <button
                onClick={handleLogout}
                style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                background: "none",
                border: "1px solid transparent",
                cursor: "pointer",
                fontSize: "13px",
                color: "var(--text-muted)",
                transition: "all 0.15s",
                textAlign: "left",
                }}
                onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                e.currentTarget.style.color = "#fca5a5";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
                }}
                onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "transparent";
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
            </button>
            </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, marginLeft: "220px", padding: "32px", minHeight: "100vh" }}>
            {children}
        </main>
        </div>
    );
}
