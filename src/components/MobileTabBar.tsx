import type { MobileTab } from "../state";

interface MobileTabBarProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}

const tabs: { id: MobileTab; label: string }[] = [
  { id: "experiment", label: "Experiment" },
  { id: "image", label: "Image" },
  { id: "control", label: "Controls" },
];

export default function MobileTabBar({ activeTab, onChange }: MobileTabBarProps) {
  return (
    <div className="mobile-tabbar" role="tablist" aria-label="Mobile tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
