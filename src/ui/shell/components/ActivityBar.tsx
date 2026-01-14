import React from "react";

type ViewMode = "explorer" | "instructions" | "visualizer" | "missions";

interface ActivityBarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const items: Array<{ id: ViewMode; label: string; emoji: string }> = [
    { id: "explorer", label: "Explorer", emoji: "🗂️" },
    { id: "instructions", label: "Instructions", emoji: "📋" },
    { id: "visualizer", label: "Git Graph", emoji: "🌳" },
    { id: "missions", label: "Missions", emoji: "🎯" },
  ];

  return (
    <nav 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 4, 
        paddingTop: 8 
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((it) => {
        const isActive = activeView === it.id;
        
        return (
          <button
            key={it.id}
            title={it.label}
            onClick={() => onViewChange(it.id)}
            aria-label={it.label}
            aria-current={isActive ? "page" : undefined}
            className={`activity-bar-icon ${isActive ? "is-active" : ""}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              border: "none",
              background: isActive ? "var(--vsc-accent)" : "transparent",
              color: isActive ? "#fff" : "var(--vsc-muted)",
              cursor: "pointer",
              position: "relative",
              outline: "none",
            }}
          >
            <span style={{ fontSize: 20 }}>{it.emoji}</span>
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "#fff",
                }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export type { ViewMode };
