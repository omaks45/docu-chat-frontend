import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
        fontFamily: {
            sans: ["var(--font-sans)"],
            mono: ["var(--font-mono)"],
        },
        },
    },
    plugins: [],
} satisfies Config;
