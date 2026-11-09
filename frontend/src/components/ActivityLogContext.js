import { createContext, useContext } from "react";

export const SEVERITY_LABELS = {
  info: { icon: "ℹ", label: "Info" },
  warning: { icon: "▲", label: "Warning" },
  critical: { icon: "●", label: "Critical" },
};

export const ActivityLogContext = createContext(null);

/**
 * Use this anywhere to append to the log:
 *   const { addEntry } = useActivityLog();
 *   addEntry({ severity: "critical", message: "Heart rate above threshold" });
 */
export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) {
    throw new Error("useActivityLog must be used inside <ActivityLogProvider>");
  }
  return ctx;
}