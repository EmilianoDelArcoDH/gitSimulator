// src/Terminal.jsx
import React, { useState, useRef, useEffect } from "react";
import { runCommand } from "./commandRunner";
import { gitCurrentBranchName } from "./gitService";

const prompt = "git-trainer$ ";

export function Terminal() {
  const [lines, setLines] = useState([
    "Bienvenido a Git Trainer",
    'Escribí "help" para ver los comandos disponibles.',
  ]);
  const [current, setCurrent] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [prompt, setPrompt] = useState("main");
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      // solo se scrollea dentro del panel, no la página entera
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  const appendLine = (line) => {
    setLines((prev) => [...prev, line]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = current;
    if (!input.trim()) return;

    // guardar en historial
    setHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);

    // mostrar comando
    appendLine(`${prompt}${input}`);
    setCurrent("");

    // clear se maneja del lado del frontend
    if (input.trim() === "clear") {
      setLines([]);
      return;
    }

    try {
      const result = await runCommand(input);
      if (result) appendLine(result);

      if (input.trim().startsWith("git ")) {
        await updatePrompt();
      }


    } catch (err) {
      appendLine(`Error: ${err.message || String(err)}`);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+L también limpia pantalla
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setLines([]);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        const nextIndex = prev === -1 ? history.length - 1 : Math.max(0, prev - 1);
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
  const updatePrompt = async () => {
    try {
      const b = await gitCurrentBranchName();
      setPrompt(b || "main");
    } catch {
      setPrompt("main");
    }
  };


  return (
    <div
      style={{
        background: "#0C0C0C", // fondo terminal estilo Git Bash
        color: "#E5E5E5",
        fontFamily: "'Consolas', 'Courier New', monospace",
        padding: "14px",
        borderRadius: "8px",
        height: "420px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #333", // borde estilo ventana terminal
        boxShadow: "0 0 8px rgba(0,0,0,0.4)",
      }}
    >
      <div
        ref={logRef} // 👈 ref en el contenedor scrolleable
        style={{
          flex: 1,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontSize: "14px",
          lineHeight: "1.4",
          padding: "8px",
          background: "#111", // más profundo que el fondo exterior
          borderRadius: "4px",
          marginBottom: "8px",
          border: "1px solid #222",
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "8px" }}>
        {/* PROMPT ESTILO GIT BASH CON DH */}
        <span style={{ display: "flex", flexWrap: "wrap" }}>
          {/* DH@GIT-TRAINER */}
          <span style={{ color: "#3CF253" }}>DH@GIT-TRAINER</span>
          {/* MINGW64 */}
          <span style={{ color: "#C586C0" }}> MINGW64</span>
          {/* ruta */}
          <span style={{ color: "#E3BF5F" }}> ~/repo</span>
          {/* rama */}
          <span style={{ color: "#3CF253" }}> ({prompt})</span>
          {/* símbolo $ */}
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
            color: "#E5E5E5",
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
