"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { getApiError } from "@/lib/api";

// Mirrors backend password requirements exactly:
// min 8, max 128, at least 1 uppercase, at least 1 number
const registerSchema = z
    .object({
        email: z.string().min(1, "Email is required").email("Enter a valid email"),
        password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be under 128 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "8+ characters", ok: password.length >= 8 },
        { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
        { label: "Number", ok: /[0-9]/.test(password) },
    ];
    if (!password) return null;
    return (
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
        {checks.map(({ label, ok }) => (
            <span
            key={label}
            style={{
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: ok ? "var(--success)" : "var(--text-muted)",
                transition: "color 0.2s",
            }}
            >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                {ok ? (
                <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1"/>
                )}
            </svg>
            {label}
            </span>
        ))}
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const { register: registerUser } = useAuth();
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const passwordValue = watch("password", "");

    const onSubmit = async (data: RegisterForm) => {
        setServerError("");
        try {
        await registerUser(data.email, data.password);
        toast.success("Account created! Welcome to DocuChat.");
        router.push("/dashboard");
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
                Create an account
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                Already have one?{" "}
                <Link
                href="/login"
                style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "500" }}
                >
                Sign in
                </Link>
            </p>

            {/* What happens after registration */}
            <div
                style={{
                background: "var(--accent-muted)",
                border: "1px solid var(--accent-border)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                }}
            >
                ✓ Automatically assigned the <strong style={{ color: "var(--text-primary)" }}>member</strong> role &nbsp;·&nbsp;
                ✓ Welcome conversation created &nbsp;·&nbsp;
                ✓ Ready to upload documents
            </div>

            {serverError && (
                <div className="alert-error" style={{ marginBottom: "20px" }}>
                {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Email */}
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
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
                        <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {errors.email.message}
                    </p>
                )}
                </div>

                {/* Password */}
                <div className="fade-up fade-up-3" style={{ marginBottom: "16px" }}>
                <label className="label" htmlFor="password">
                    Password
                </label>
                <div style={{ position: "relative" }}>
                    <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
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
                <PasswordStrength password={passwordValue} />
                {errors.password && (
                    <p className="field-error" style={{ marginTop: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
                        <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {errors.password.message}
                    </p>
                )}
                </div>

                {/* Confirm password */}
                <div className="fade-up fade-up-4" style={{ marginBottom: "24px" }}>
                <label className="label" htmlFor="confirmPassword">
                    Confirm password
                </label>
                <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className={`input-base${errors.confirmPassword ? " error" : ""}`}
                    {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                    <p className="field-error">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
                        <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {errors.confirmPassword.message}
                    </p>
                )}
                </div>

                <div className="fade-up fade-up-5">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span className="spinner" />
                        Creating account…
                    </span>
                    ) : (
                    "Create account"
                    )}
                </button>
                </div>
            </form>
            </div>

            <p
            className="fade-up fade-up-5"
            style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}
            >
            By creating an account you agree to our terms of service.
            </p>
        </div>
        </div>
    );
}
