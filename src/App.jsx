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
    const newActivity =
      ACTIVITIES.find((a) => a.id === newId) || ACTIVITIES[0];

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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('https://assets.digitalhouse.com/content/ar/sch/trama-schools-clara.jpeg')",
        backgroundSize: "100%",
        backgroundColor: "white",
        backgroundPositionY: "50px",
        color: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "12px",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: "4px", fontSize: "24px" }}>
              Git & GitHub Trainer (Simulado)
            </h1>
            <p
              style={{
                marginBottom: "6px",
                fontSize: "14px",
                color: "#5f697cff",
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
                color: "#788ceeff",
              }}
            >
              Actividad actual:{" "}
              <strong>{currentActivity.name}</strong> –{" "}
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
                color: "#9ca3af",
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

        {/* Editor opcional */}
        {showEditor && (
          <EditorPanel key={`editor-${resetId}-${activityId}`} />
        )}

        {/* Consola + visualizador */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "20px",
            padding: "16px 0",
          }}
        >
          <Terminal key={`terminal-${resetId}-${activityId}`} />
          <GitVisualizer key={`viz-${resetId}-${activityId}`} />
        </div>

        <SuggestionsPanel key={`tips-${resetId}-${activityId}`} />

        {/* Misiones filtradas por actividad */}
        <MissionsPanel
          key={`missions-${resetId}-${activityId}`}
          enabledMissionIds={currentActivity.enabledMissionIds}
        />
      </div>
    </div>
  );
}

export default App;
