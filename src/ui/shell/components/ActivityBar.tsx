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
      className="activity-bar-container"
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
            className={`activity-bar-icon${isActive ? " is-active" : ""}`}
          >
            <span className="activity-bar-emoji">{it.emoji}</span>
            {isActive && <span className="activity-bar-indicator" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}

export type { ViewMode };
