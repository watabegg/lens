import { useState } from "react";
import "./App.css";
import { DEFAULT_STATE, type AppState, type MobileTab, type ViewMode } from "./state";
import { useLensPhysics } from "./hooks/useLensPhysics";
import ExperimentCanvas from "./components/ExperimentCanvas";
import WipePanel from "./components/WipePanel";
import ControlPanel from "./components/ControlPanel";
import MobileTabBar from "./components/MobileTabBar";

function App() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const { lensResult, imageDescriptor } = useLensPhysics(state);

  const updateState = (partial: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const handleViewModeChange = (viewMode: ViewMode) => {
    updateState({ viewMode });
  };

  const handleTabChange = (activeTab: MobileTab) => {
    updateState({ activeTab });
  };

  const handleReset = () => {
    setState(DEFAULT_STATE);
  };

  return (
    <div className="app-shell" data-active-tab={state.activeTab}>
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Convex Lens Lab</p>
          <h1 className="app-title">Lens Lab</h1>
          <p className="app-subtitle">
            Control object distance, screen distance, and focal length to see
            how images form.
          </p>
        </div>
        <div className="app-status">
          <div className="status-item">
            <span className="status-label">Mode</span>
            <span className="status-value">{state.viewMode}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Screen</span>
            <span className="status-value">
              {lensResult.isImageOnScreen ? "In focus" : "Out of focus"}
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section
          className="panel panel--experiment"
          aria-label="Experiment canvas"
        >
          <div className="panel-header">
            <h2>Experiment</h2>
            <span className="panel-meta">
              SVG view, lens centered, cm scale
            </span>
          </div>
          <ExperimentCanvas
            state={state}
            lensResult={lensResult}
            showRays={state.showRays}
            viewMode={state.viewMode}
          />
        </section>

        <section className="panel panel--control" aria-label="Controls">
          <div className="panel-header">
            <h2>Controls</h2>
            <span className="panel-meta">Adjust distances and view</span>
          </div>
          <ControlPanel
            state={state}
            lensResult={lensResult}
            onChange={updateState}
            onViewModeChange={handleViewModeChange}
            onReset={handleReset}
          />
        </section>
      </main>

      <section className="panel panel--image" aria-label="Image analysis">
        <div className="panel-header">
          <h2>Image Study</h2>
          <span className="panel-meta">Original vs screen vs observed</span>
        </div>
        <WipePanel
          state={state}
          lensResult={lensResult}
          imageDescriptor={imageDescriptor}
        />
      </section>

      <MobileTabBar activeTab={state.activeTab} onChange={handleTabChange} />
    </div>
  );
}

export default App;
