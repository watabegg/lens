import { useState } from "react";
import "./App.css";
import { DEFAULT_STATE, type AppState, type MobileTab, type ViewMode } from "./state";
import { useLensPhysics } from "./hooks/useLensPhysics";
import ExperimentCanvas from "./components/ExperimentCanvas";
import WipePanel from "./components/WipePanel";
import ControlPanel from "./components/ControlPanel";
import MobileTabBar from "./components/MobileTabBar";

const viewModeLabel = (mode: ViewMode) => (mode === "simple" ? "シンプル" : "詳細");

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
          <p className="app-eyebrow">凸レンズ実験</p>
          <h1 className="app-title">凸レンズラボ</h1>
          <p className="app-subtitle">
            物体距離・スクリーン距離・焦点距離を動かして像の変化を観察しよう。
          </p>
        </div>
        <div className="app-status">
          <div className="status-item">
            <span className="status-label">モード</span>
            <span className="status-value">{viewModeLabel(state.viewMode)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">ピント</span>
            <span className="status-value">
              {lensResult.isImageOnScreen ? "合焦" : "ぼけ"}
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section
          className="panel panel--experiment"
          aria-label="実験図"
        >
          <div className="panel-header">
            <h2>実験図</h2>
            <span className="panel-meta">SVG・レンズ中心・cmスケール</span>
          </div>
          <ExperimentCanvas
            state={state}
            lensResult={lensResult}
            showRays={state.showRays}
            viewMode={state.viewMode}
          />
        </section>

        <section className="panel panel--control" aria-label="操作">
          <div className="panel-header">
            <h2>操作</h2>
            <span className="panel-meta">距離と表示を調整</span>
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

      <section className="panel panel--image" aria-label="像の観察">
        <div className="panel-header">
          <h2>像の観察</h2>
          <span className="panel-meta">元の物体・スクリーン・観察像</span>
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
