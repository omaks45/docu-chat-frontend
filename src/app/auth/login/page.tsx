"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { getApiError } from "@/lib/api";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        setServerError("");
        try {
        await login(data.email, data.password);
        toast.success("Welcome back!");
        const from = searchParams.get("from") ?? "/dashboard";
        router.push(from);
        } catch (err) {
        setServerError(getApiError(err));
        }
    };

    return (
        <div
        className="auth-mesh"
        style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
        }}
        >
        <div style={{ width: "100%", maxWidth: "400px" }}>
            {/* Logo */}
            <div className="fade-up" style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
                style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "var(--accent-muted)",
                border: "1px solid var(--accent-border)",
                marginBottom: "16px",
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                    d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2"
                    stroke="var(--accent)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                />
                <path
                    d="M9 4h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z"
                    stroke="var(--accent)"
                    strokeWidth="1.75"
                />
                </svg>
            </div>
            <h1
                style={{
                fontSize: "22px",
                fontWeight: "600",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                }}
            >
                DocuChat
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                AI-powered document intelligence
            </p>
            </div>

            {/* Card */}
            <div className="card fade-up fade-up-1" style={{ padding: "32px" }}>
            <h2
                style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "4px",
                letterSpacing: "-0.01em",
                }}
            >
                Sign in
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                Don&apos;t have an account?{" "}
                <Link
                href="/register"
                style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "500" }}
                >
                Create one
                </Link>
            </p>

            {/* Server error */}
            {serverError && (
                <div className="alert-error" style={{ marginBottom: "20px" }}>
                {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="fade-up fade-up-2" style={{ marginBottom: "16px" }}>
                <label className="label" htmlFor="email">
                    Email address
                </label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`input-base${errors.email ? " error" : ""}`}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="field-error">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                        <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {errors.email.message}
                    </p>
                )}
                </div>

                <div className="fade-up fade-up-3" style={{ marginBottom: "24px" }}>
                <label className="label" htmlFor="password">
                    Password
                </label>
                <div style={{ position: "relative" }}>
                    <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    className={`input-base${errors.password ? " error" : ""}`}
                    style={{ paddingRight: "44px" }}
                    {...register("password")}
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                    {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        </svg>
                    )}
                    </button>
                </div>
                {errors.password && (
                    <p className="field-error">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                        <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {errors.password.message}
                    </p>
                )}
                </div>

                <div className="fade-up fade-up-4">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span className="spinner" />
                        Signing in…
                    </span>
                    ) : (
                    "Sign in"
                    )}
                </button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
}
