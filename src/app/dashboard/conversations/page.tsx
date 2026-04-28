"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiError } from "@/lib/api";

interface Message {
    content: string;
    role: string;
    createdAt: string;
}

interface Conversation {
    id: string;
    title: string | null;
    messageCount: number;
    lastMessage: Message | null;
    updatedAt: string;
}

interface ConversationsResponse {
    success: boolean;
    data: Conversation[];
    meta: { page: number; limit: number; total: number };
}

export default function ConversationsPage() {
    const [showNew, setShowNew] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["conversations"],
        queryFn: () =>
        api.get<ConversationsResponse>("/conversations").then((r) => r.data),
    });

    const { mutate: createConvo, isPending } = useMutation({
        mutationFn: () =>
        api.post("/conversations", { title: newTitle || undefined }).then((r) => r.data),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        toast.success("Conversation started");
        setShowNew(false);
        setNewTitle("");
        },
        onError: (err) => toast.error(getApiError(err)),
    });

    const conversations = data?.data ?? [];

    return (
        <div className="fade-up">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
            <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Conversations
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Chat with your documents
            </p>
            </div>
            <button
            className="btn-primary"
            style={{ width: "auto", padding: "10px 18px", display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setShowNew(true)}
            >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New conversation
            </button>
        </div>

        {/* New conversation inline form */}
        {showNew && (
            <div className="card fade-up" style={{ padding: "20px", marginBottom: "20px", borderColor: "var(--accent-border)" }}>
            <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "12px" }}>
                New conversation
            </p>
            <input
                className="input-base"
                placeholder="Title (optional)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ marginBottom: "12px" }}
                onKeyDown={(e) => e.key === "Enter" && createConvo()}
            />
            <div style={{ display: "flex", gap: "8px" }}>
                <button
                className="btn-primary"
                style={{ width: "auto", padding: "9px 18px" }}
                onClick={() => createConvo()}
                disabled={isPending}
                >
                {isPending ? <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span className="spinner"/>Creating…</span> : "Create"}
                </button>
                <button
                onClick={() => { setShowNew(false); setNewTitle(""); }}
                style={{ padding: "9px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}
                >
                Cancel
                </button>
            </div>
            </div>
        )}

        {/* List */}
        {isLoading ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
            <span className="spinner" style={{ width: "24px", height: "24px" }} />
            </div>
        ) : conversations.length === 0 ? (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: "12px" }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                No conversations yet. Start one to chat with your documents.
            </p>
            </div>
        ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {conversations.map((c) => (
                <div
                key={c.id}
                className="card"
                style={{
                    padding: "16px 20px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-border)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--bg-border)")}
                >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {c.title ?? "Untitled conversation"}
                    </p>
                    {c.lastMessage && (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>
                        {c.lastMessage.role === "user" ? "You" : "AI"}:
                        </span>{" "}
                        {c.lastMessage.content}
                    </p>
                    )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {new Date(c.updatedAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {c.messageCount} msg{c.messageCount !== 1 ? "s" : ""}
                    </p>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
