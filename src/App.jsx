// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Terminal } from "./Terminal";
import { initFileSystem } from "./gitFs";
import { useTheme } from "./ui/theme/ThemeProvider";
import { EditorProvider } from "./ui/editor/EditorContext";
// VS Code-like UI shell
import AppShell from "./ui/shell/AppShell";
import EditorArea from "./ui/panels/EditorArea";
import BottomPanel from "./ui/panels/BottomPanel";
import StatusBar from "./ui/shell/components/StatusBar";

function App({ activity, allActivities = [], navigateToActivity, resetting = false }) {
  const [resetId, setResetId] = useState(0);
  const { theme } = useTheme();

  const currentActivity = useMemo(() => activity, [activity]);

  useEffect(() => {
    initFileSystem();
  }, []);

  useEffect(() => {
    setResetId((id) => id + 1);
  }, [currentActivity?.id]);

  const resetKey = `${resetId}-${currentActivity?.id || "unknown"}`;

  return (
    <EditorProvider>
      <AppShell
        theme={theme === "dark" ? "dark" : "light"}
        activity={currentActivity}
        resetKey={resetKey}
        editorArea={<EditorArea />}
        bottomPanel={
          <BottomPanel>
            <div style={{ padding: 8 }}>
              <Terminal key={`terminal-${resetKey}`} theme={theme} />
            </div>
          </BottomPanel>
        }
        statusLeft={
          <span style={{ fontSize: 11 }}>
            {currentActivity?.id || "No activity"} {resetting && "• Resetting..."}
          </span>
        }
        statusRight={
          <StatusBar right={<span style={{ fontSize: 11, opacity: 0.8 }}>Git Trainer Simulator</span>} />
        }
      />
    </EditorProvider>
  );
}

export default App;
