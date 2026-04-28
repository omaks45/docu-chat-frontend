"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiError } from "@/lib/api";

interface Document {
    id: string;
    title: string;
    filename: string;
    status: "pending" | "processing" | "ready" | "failed";
    chunkCount: number;
    createdAt: string;
    updatedAt: string;
}

interface DocumentsResponse {
    success: boolean;
    data: Document[];
    meta: { page: number; limit: number; total: number };
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    pending:    { bg: "rgba(245,158,11,0.1)",  color: "#fbbf24", label: "Pending" },
    processing: { bg: "rgba(99,102,241,0.1)",  color: "#818cf8", label: "Processing" },
    ready:      { bg: "rgba(34,197,94,0.1)",   color: "#4ade80", label: "Ready" },
    failed:     { bg: "rgba(239,68,68,0.1)",   color: "#f87171", label: "Failed" },
};

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
    return (
        <span
        style={{
            fontSize: "11px",
            fontWeight: "500",
            padding: "3px 8px",
            borderRadius: "99px",
            background: s.bg,
            color: s.color,
            letterSpacing: "0.02em",
        }}
        >
        {s.label}
        </span>
    );
}

function UploadModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
        api.post("/documents", { title, content }).then((r) => r.data),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        toast.success("Document uploaded — processing in background");
        onClose();
        },
        onError: (err) => toast.error(getApiError(err)),
    });

    return (
        <div
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "24px",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        >
        <div
            className="card fade-up"
            style={{ width: "100%", maxWidth: "480px", padding: "28px" }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                Upload document
            </h3>
            <button
                onClick={onClose}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
            <label className="label">Title</label>
            <input
                className="input-base"
                placeholder="e.g. Q3 Financial Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            </div>

            <div style={{ marginBottom: "24px" }}>
            <label className="label">Content</label>
            <textarea
                className="input-base"
                placeholder="Paste your document content here…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ minHeight: "140px", resize: "vertical", fontFamily: "var(--font-mono)", fontSize: "13px" }}
            />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
                onClick={onClose}
                style={{
                padding: "10px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-secondary)",
                fontSize: "13px",
                cursor: "pointer",
                }}
            >
                Cancel
            </button>
            <button
                className="btn-primary"
                style={{ width: "auto", padding: "10px 22px" }}
                onClick={() => mutate()}
                disabled={!title.trim() || !content.trim() || isPending}
            >
                {isPending ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="spinner" /> Uploading…
                </span>
                ) : "Upload"}
            </button>
            </div>
        </div>
        </div>
    );
}

export default function DocumentsPage() {
    const [showUpload, setShowUpload] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["documents", { search, status, page }],
        queryFn: () =>
        api
            .get<DocumentsResponse>("/documents", {
            params: { search: search || undefined, status: status || undefined, page, limit: 20 },
            })
            .then((r) => r.data),
    });

    const { mutate: deleteDoc } = useMutation({
        mutationFn: (id: string) => api.delete(`/documents/${id}`),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        toast.success("Document deleted");
        },
        onError: (err) => toast.error(getApiError(err)),
    });

    const docs = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="fade-up">
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
            <h1 style={{ fontSize: "22px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Documents
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {meta?.total != null ? `${meta.total} document${meta.total !== 1 ? "s" : ""}` : "Upload and manage your files"}
            </p>
            </div>
            <button
            className="btn-primary"
            style={{ width: "auto", padding: "10px 18px", display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setShowUpload(true)}
            >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Upload
            </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
            className="input-base"
            style={{ maxWidth: "240px" }}
            placeholder="Search documents…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select
            className="input-base"
            style={{ maxWidth: "160px" }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="failed">Failed</option>
            </select>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
            {isLoading ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
                <span className="spinner" style={{ width: "24px", height: "24px" }} />
            </div>
            ) : docs.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: "12px" }}>
                <path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2"/>
                <path d="M9 4h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z"/>
                </svg>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No documents yet. Upload one to get started.</p>
            </div>
            ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    {["Title", "Status", "Chunks", "Created", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {h}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {docs.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: "1px solid var(--bg-border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                    <td style={{ padding: "14px 16px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>{doc.title}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>{doc.filename}</p>
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={doc.status} /></td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{doc.chunkCount}</td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                        onClick={() => deleteDoc(doc.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", borderRadius: "4px", transition: "color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        title="Delete document"
                        >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                        </svg>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>

        {/* Pagination */}
        {meta && meta.total > meta.limit && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
            <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ padding: "8px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", opacity: page <= 1 ? 0.4 : 1 }}
            >
                Previous
            </button>
            <span style={{ padding: "8px 14px", fontSize: "13px", color: "var(--text-muted)" }}>
                Page {page} of {Math.ceil(meta.total / meta.limit)}
            </span>
            <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(meta.total / meta.limit)}
                style={{ padding: "8px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", opacity: page >= Math.ceil(meta.total / meta.limit) ? 0.4 : 1 }}
            >
                Next
            </button>
            </div>
        )}
        </div>
    );
}
