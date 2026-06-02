import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders a LaTeX equation string using KaTeX.
 * Shows the raw string as a fallback if KaTeX throws.
 */
export default function MathRenderer({ latex, block = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !latex?.trim()) return;
    try {
      katex.render(latex.trim(), ref.current, {
        displayMode: block,
        throwOnError: false,
        strict: "warn",
      });
    } catch {
      ref.current.textContent = latex;
    }
  }, [latex, block]);

  if (!latex?.trim()) return null;
  return <span ref={ref} className={className} />;
}
