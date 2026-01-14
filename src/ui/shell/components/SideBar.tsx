import React from "react";
import type { ViewMode } from "./ActivityBar";
import ExplorerPanel from "../../panels/ExplorerPanel";
import InstructionsPanel from "../../panels/InstructionsPanel";
import GitVisualizerPanel from "../../panels/GitVisualizerPanel";
import MissionsPanelWrapper from "../../panels/MissionsPanelWrapper";

interface SideBarProps {
  activeView: ViewMode;
  activity?: any;
  theme?: "dark" | "light";
  resetKey?: string;
  onToggleGitGraph?: () => void;
  isGitGraphMaximized?: boolean;
}

const VIEW_TITLES: Record<ViewMode, string> = {
  explorer: "EXPLORER",
  instructions: "INSTRUCTIONS",
  visualizer: "GIT GRAPH",
  missions: "MISSIONS",
};

export default function SideBar({ activeView, activity, theme = "dark", resetKey, onToggleGitGraph, isGitGraphMaximized }: SideBarProps) {
  const renderContent = () => {
    switch (activeView) {
      case "explorer":
        return <ExplorerPanel />;
      case "instructions":
        return <InstructionsPanel activity={activity} />;
      case "visualizer":
        return (
          <GitVisualizerPanel
            theme={theme}
            resetKey={resetKey}
            onToggleMaximize={onToggleGitGraph}
            isMaximized={isGitGraphMaximized}
          />
        );
      case "missions":
        return <MissionsPanelWrapper activity={activity} theme={theme} />;
      default:
        return <div style={{ padding: 16, fontSize: 12, opacity: 0.6 }}>Panel no encontrado</div>;
    }
  };

  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid var(--vsc-border)",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          opacity: 0.9,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        {VIEW_TITLES[activeView]}
      </div>
      <div
        key={activeView}
        className="sidebar-panel-content"
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
