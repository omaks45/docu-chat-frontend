"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();

    const cards = [
        {
        title: "Documents",
        description: "Upload and manage your documents",
        href: "/documents",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2"/>
            <path d="M9 4h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z"/>
            </svg>
        ),
        action: "Go to Documents",
        },
        {
        title: "Conversations",
        description: "Chat with your documents using AI",
        href: "/conversations",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
        ),
        action: "Go to Conversations",
        },
    ];

    return (
        <div className="fade-up">
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
            <h1
            style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: "6px",
            }}
            >
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Your DocuChat workspace is ready.
            </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {cards.map((card) => (
            <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
                <div
                className="card"
                style={{
                    padding: "24px",
                    cursor: "pointer",
                    transition: "border-color 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-border)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--bg-border)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
                >
                <div
                    style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "var(--accent-muted)",
                    border: "1px solid var(--accent-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                    marginBottom: "16px",
                    }}
                >
                    {card.icon}
                </div>
                <h3
                    style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                    letterSpacing: "-0.01em",
                    }}
                >
                    {card.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.5" }}>
                    {card.description}
                </p>
                <span
                    style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    }}
                >
                    {card.action}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </span>
                </div>
            </Link>
            ))}
        </div>

        {/* Account info */}
        <div
            className="card"
            style={{ padding: "20px 24px", marginTop: "24px", display: "flex", alignItems: "center", gap: "16px" }}
        >
            <div
            style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--accent-muted)",
                border: "1px solid var(--accent-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                fontSize: "14px",
                fontWeight: "600",
                flexShrink: 0,
            }}
            >
            {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
            <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>
                {user?.email}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Tier: <span style={{ color: "var(--accent)", fontWeight: "500" }}>{user?.tier ?? "free"}</span>
            </p>
            </div>
        </div>
        </div>
    );
}
