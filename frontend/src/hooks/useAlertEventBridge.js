
import { useCallback, useRef } from 'react';
import { createAlertEventTracker } from '../alertEventTracker';

export default function useAlertEventBridge({
  onToast,
  onLog,
} = {}) {
  const trackerRef = useRef(null);

  if (trackerRef.current === null) {
    trackerRef.current = createAlertEventTracker();
  }

  const handleAlarmChange = useCallback(
    (alarmState) => {
      trackerRef.current.processAlarmChange(
        alarmState,
        (event) => {
          onToast?.(event);
          onLog?.(event);
        }
      );
    },
    [onToast, onLog]
  );

  return handleAlarmChange;
}
