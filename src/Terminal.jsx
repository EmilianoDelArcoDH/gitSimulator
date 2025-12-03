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
  const [prompt, setPrompt] = useState("git-trainer$ ");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div
      style={{
        background: "#111",
        color: "#eee",
        fontFamily: "monospace",
        padding: "12px",
        borderRadius: "8px",
        height: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontSize: "14px",
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "8px" }}>
        <span>{prompt}</span>
        <input
          autoFocus
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={handleKeyDown}   // 👈 historial + clear
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#eee",
            fontFamily: "monospace",
            fontSize: "14px",
            width: "80%",
          }}
        />
      </form>
    </div>
  );
}
