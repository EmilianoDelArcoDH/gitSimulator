// src/Terminal.jsx
import React, { useState, useRef, useEffect } from "react";
import { runCommand } from "./commandRunner";
import { gitCurrentBranchName } from "./gitService";

const PROMPT_PREFIX = "$";

export function Terminal({ theme }) {
  const [lines, setLines] = useState([
    "Bienvenido a Git Trainer",
    'Escribí "help" para ver los comandos disponibles.',
  ]);
  const [current, setCurrent] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [branch, setBranch] = useState("main");
  const logRef = useRef(null);

  // Estado para el tip educativo
  const [hint, setHint] = useState(null);
  const hintTimeoutRef = useRef(null);

  // Cargar rama actual al montar
  useEffect(() => {
    updateBranch();
  }, []);

  // Autoscroll dentro del panel
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  // Cleanup del timeout del hint
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const appendLine = (line) => {
    setLines((prev) => [...prev, line]);
  };

  const updateBranch = async () => {
    try {
      const b = await gitCurrentBranchName();
      setBranch(b || "main");
    } catch {
      setBranch("main");
    }
  };

  // Separa el texto normal del hint, usando los marcadores especiales
  function splitResultAndHint(result) {
    const START = "[[HINT_START]]";
    const END = "[[HINT_END]]";

    const startIndex = result.indexOf(START);
    const endIndex = result.indexOf(END);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      // No hay hint embebido
      return { text: result, hint: null };
    }

    const text = result.slice(0, startIndex).trimEnd();
    const hintBody = result
      .slice(startIndex + START.length, endIndex)
      .trim();

    return { text, hint: hintBody || null };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = current;
    if (!input.trim()) return;

    // guardar en historial
    setHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);

    // mostrar comando en el log
    appendLine(`${PROMPT_PREFIX}${branch}: ${input}`);
    setCurrent("");

    // clear se maneja del lado del frontend
    if (input.trim() === "clear") {
      setLines([]);
      return;
    }

    try {
      const result = await runCommand(input);
      if (result) {
        const { text, hint: newHint } = splitResultAndHint(result);

        if (text) {
          appendLine(text);
        }

        if (newHint) {
          // Limpiamos cualquier timeout anterior
          if (hintTimeoutRef.current) {
            clearTimeout(hintTimeoutRef.current);
          }

          // Mostramos el tip
          setHint(newHint);

          // Lo ocultamos automáticamente después de 8 segundos
          hintTimeoutRef.current = setTimeout(() => {
            setHint(null);
          }, 8000);
        }
      }

      if (input.trim().startsWith("git ")) {
        await updateBranch();
      }
    } catch (err) {
      appendLine(`Error: ${err.message || String(err)}`);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+L limpia la pantalla
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setLines([]);
      return;
    }

    // Historial con flechas
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        const nextIndex =
          prev === -1 ? history.length - 1 : Math.max(0, prev - 1);
        setCurrent(history[nextIndex] || "");
        return nextIndex;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        if (prev === -1) return -1;
        const nextIndex = prev + 1;
        if (nextIndex >= history.length) {
          setCurrent("");
          return -1;
        }
        setCurrent(history[nextIndex] || "");
        return nextIndex;
      });
    }
  };

  return (
    <div
      style={{
        background: theme === "dark" ? "#0C0C0C" : "#ffffff",
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        border: `1px solid ${theme === "dark" ? "#333" : "#cbd5e1"}`,
        fontFamily: "'Consolas', 'Courier New', monospace",
        padding: "14px",
        borderRadius: "8px",
        height: "420px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 8px rgba(0,0,0,0.4)",
      }}
    >
      <div
        ref={logRef}
        style={{
          flex: 1,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontSize: "14px",
          lineHeight: "1.4",
          padding: "8px",
          background: "#111",
          borderRadius: "4px",
          marginBottom: "8px",
          border: "1px solid #222",
          color: "#e5e7eb",
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Cartelito del tip educativo */}
      {hint && (
        <div
          style={{
            marginBottom: "6px",
            padding: "6px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            background: theme === "dark" ? "#1f2937" : "#e5f3ff",
            color: theme === "dark" ? "#e5e7eb" : "#1f2937",
            border: `1px solid ${theme === "dark" ? "#3b82f6" : "#60a5fa"}`,
          }}
        >
          <strong style={{ marginRight: 4 }}>💡 Tip:</strong>
          <pre
            style={{
              display: "inline",
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
            }}
          >
            {hint}
          </pre>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: "4px" }}>
        {/* PROMPT ESTILO GIT BASH CON DH */}
        <span style={{ display: "flex", flexWrap: "wrap" }}>
          <span style={{ color: "#3CF253" }}>DH@GIT-TRAINER</span>
          <span style={{ color: "#C586C0" }}> MINGW64</span>
          <span style={{ color: "#E3BF5F" }}> ~/repo</span>
          <span style={{ color: "#3CF253" }}> ({branch})</span>
          <span style={{ color: "#FFFFFF" }}>$ </span>
        </span>
        <input
          autoFocus
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: theme === "dark" ? "#e5e7eb" : "#1f2937",
            fontFamily: "'Consolas', monospace",
            fontSize: "14px",
            paddingLeft: "6px",
            width: "80%",
          }}
        />
      </form>
    </div>
  );
}
