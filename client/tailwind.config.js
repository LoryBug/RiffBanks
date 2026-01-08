@import "tailwindcss";

@theme {
  --font-mono: "Space Mono", monospace;
  --font-sans: "Inter", sans-serif;

  --color-bg-zero: var(--bg-zero);
  --color-surface-zero: var(--surface-zero);
  --color-border-zero: var(--border-zero);
  --color-text-main: var(--text-main);
  --color-text-dim: var(--text-dim);
  --color-accent: var(--accent);
  --color-accent-dim: var(--accent-dim);

  --shadow-glow: 0 0 20px var(--shadow-glow);
}

@layer base {
  :root {
    --bg-zero: #000000;
    --shadow-glow: rgba(255, 255, 255, 0.5); 
  }
}