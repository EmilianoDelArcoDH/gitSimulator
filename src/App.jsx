// src/App.jsx
import React, { useEffect, useState } from "react";
import { Terminal } from "./Terminal";
import { GitVisualizer } from "./GitVisualizer";
import { MissionsPanel } from "./MissionsPanel";
import { EditorPanel } from "./EditorPanel";
import { initFileSystem } from "./gitFs";
import { resetEnvironment } from "./envReset";
import { ACTIVITIES } from "./activitiesConfig";
import { SuggestionsPanel } from "./SuggestionsPanel";

function App() {
  const [resetId, setResetId] = useState(0);
  const [resetting, setResetting] = useState(false);

  const [activityId, setActivityId] = useState(ACTIVITIES[0].id);
  const [theme, setTheme] = useState("dark"); // "dark" o "light"

  const currentActivity =
    ACTIVITIES.find((a) => a.id === activityId) || ACTIVITIES[0];

  // El editor arranca según la actividad actual
  const [showEditor, setShowEditor] = useState(currentActivity.showEditor);

  useEffect(() => {
    initFileSystem();
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetEnvironment();
      setResetId((id) => id + 1);
    } catch (e) {
      console.error("Error al reiniciar entorno:", e);
    } finally {
      setResetting(false);
    }
  };

  const handleActivityChange = async (e) => {
    const newId = e.target.value;
    const newActivity = ACTIVITIES.find((a) => a.id === newId) || ACTIVITIES[0];

    setActivityId(newId);
    setShowEditor(newActivity.showEditor);

    // Opcional pero muy útil: al cambiar de actividad, reiniciamos el entorno
    setResetting(true);
    try {
      await resetEnvironment();
      setResetId((id) => id + 1);
    } catch (err) {
      console.error("Error al reiniciar al cambiar de actividad:", err);
    } finally {
      setResetting(false);
    }
  };

  const themes = {
    light: {
      appBackground: {
        backgroundImage:
          "url('https://assets.digitalhouse.com/content/ar/sch/trama-schools-clara.jpeg')",
        backgroundSize: "100%",
        backgroundColor: "white",
        backgroundPositionY: "50px",
        color: "#1f2937",
      },
      cardBg: "#ffffff",
      text: "#1f2937",
      subtle: "#475569",
      border: "#cbd5e1",
    },

    dark: {
      appBackground: {
        backgroundColor: "#020617",
        color: "#e5e7eb",
      },
      cardBg: "#0f172a",
      text: "#e5e7eb",
      subtle: "#94a3b8",
      border: "#1f2937",
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        ...themes[theme].appBackground, // 👈 aplica tema dinámico
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px 16px 32px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "16px",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                marginBottom: "4px",
                fontSize: "24px",
                color: "#f9fafb",
              }}
            >
              Git & GitHub Trainer (Simulado)
            </h1>
            <p
              style={{
                marginBottom: "6px",
                fontSize: "14px",
                color: "#9ca3af",
              }}
            >
              Practicá comandos Git, simulá un remoto tipo GitHub y completá
              misiones. Activá el editor cuando la actividad lo requiera.
            </p>
            {/* Descripción de la actividad actual */}
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              Actividad actual: <strong>{currentActivity.name}</strong> –{" "}
              {currentActivity.description}
            </p>
          </div>

          {/* Controles: selector de actividad + botones */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              minWidth: "230px",
            }}
          >
            <label
              style={{
                fontSize: "12px",
                color: "#cbd5f5",
              }}
            >
              Elegí una actividad:
              <select
                value={activityId}
                onChange={handleActivityChange}
                style={{
                  marginTop: "2px",
                  width: "100%",
                  padding: "4px 6px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "1px solid #374151",
                  background: "#020617",
                  color: "#e5e7eb",
                }}
              >
                {ACTIVITIES.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                background: theme === "dark" ? "#eab308" : "#1e293b",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                color: theme === "dark" ? "#1f2937" : "#f9fafb",
                cursor: "pointer",
              }}
            >
              Modo {theme === "dark" ? "Claro 🌞" : "Oscuro 🌙"}
            </button>

            <button
              onClick={() => setShowEditor((v) => !v)}
              style={{
                background: "#0ea5e9",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                color: "#f9fafb",
                cursor: "pointer",
              }}
            >
              {showEditor ? "Ocultar editor" : "Mostrar editor"}
            </button>

            <button
              onClick={handleReset}
              disabled={resetting}
              style={{
                background: "#ef4444",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "13px",
                color: "#f9fafb",
                cursor: "pointer",
                opacity: resetting ? 0.7 : 1,
              }}
            >
              {resetting ? "Reiniciando..." : "Reiniciar entorno"}
            </button>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL: IZQUIERDA (editor + terminal) / DERECHA (viz + tips + misiones) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {/* Columna izquierda */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {showEditor && (
              <EditorPanel key={`editor-${resetId}-${activityId}`} />
            )}

            <Terminal key={`terminal-${resetId}-${activityId}`} />
          </div>

          {/* Columna derecha */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <GitVisualizer key={`viz-${resetId}-${activityId}`} />

            <SuggestionsPanel key={`tips-${resetId}-${activityId}`} />

            <MissionsPanel
              key={`missions-${resetId}-${activityId}`}
              enabledMissionIds={currentActivity.enabledMissionIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
