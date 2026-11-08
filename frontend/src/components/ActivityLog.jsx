import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityLogContext, SEVERITY_LABELS, useActivityLog } from "./ActivityLogContext";
import "./ActivityLog.css";

const MAX_ENTRIES = 200;

/**
 * Wrap the app once. Holds the log history in memory (newest first, capped).
 */
export function ActivityLogProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const nextId = useRef(1);

  // addEntry({ severity: "info" | "warning" | "critical", message: string })
  const addEntry = useCallback(({ severity = "info", message }) => {
    const entry = {
      id: nextId.current++,
      severity: SEVERITY_LABELS[severity] ? severity : "info",
      message,
      timestamp: new Date(),
      read: false,
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  const markAllRead = useCallback(() => {
    setEntries((prev) => prev.map((e) => (e.read ? e : { ...e, read: true })));
  }, []);

  const clearAll = useCallback(() => setEntries([]), []);

  const value = useMemo(
    () => ({ entries, addEntry, markAllRead, clearAll }),
    [entries, addEntry, markAllRead, clearAll]
  );

  return <ActivityLogContext.Provider value={value}>{children}</ActivityLogContext.Provider>;
}

/**
 * Bottom-docked, collapsible activity log. Render once near the app root.
 */
export default function ActivityLog() {
  const { entries, markAllRead, clearAll } = useActivityLog();
  const [expanded, setExpanded] = useState(false);

  const unreadCount = entries.filter((e) => !e.read).length;

  return (
    <section className="activity-log" aria-label="Activity log">
      <div className="activity-log__bar">
        <button
          type="button"
          className="activity-log__toggle"
          aria-expanded={expanded}
          aria-controls="activity-log-panel"
          onClick={() => setExpanded((v) => !v)}
        >
          <span aria-hidden="true">{expanded ? "▾" : "▴"}</span>
          <span>Activity Log</span>
          {unreadCount > 0 && (
            <span className="activity-log__badge">{unreadCount} unread</span>
          )}
        </button>

        {expanded && (
          <div className="activity-log__actions">
            <button type="button" onClick={markAllRead} disabled={unreadCount === 0}>
              Mark all read
            </button>
            <button type="button" onClick={clearAll} disabled={entries.length === 0}>
              Clear
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div id="activity-log-panel" className="activity-log__panel">
          {entries.length === 0 ? (
            <p className="activity-log__empty">No activity yet.</p>
          ) : (
            <ul className="activity-log__list" role="log" aria-live="off" tabIndex={0}>
              {entries.map((entry) => {
                const { icon, label } = SEVERITY_LABELS[entry.severity];
                return (
                  <li
                    key={entry.id}
                    className={`activity-log__entry activity-log__entry--${entry.severity}${
                      entry.read ? "" : " activity-log__entry--unread"
                    }`}
                  >
                    <span className="activity-log__severity">
                      <span aria-hidden="true">{icon}</span> {label}
                    </span>
                    <time
                      className="activity-log__time"
                      dateTime={entry.timestamp.toISOString()}
                      title={entry.timestamp.toLocaleString()}
                    >
                      {entry.timestamp.toLocaleTimeString()}
                    </time>
                    <span className="activity-log__message">{entry.message}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}