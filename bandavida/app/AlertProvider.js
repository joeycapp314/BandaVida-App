import React, { createContext, useContext, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";


const AlertContext = createContext();

export default function AlertProvider({ children }) {
  const [allAlerts, setAllAlerts] = React.useState([]);
  const lastAlertId = useRef(null);

  useEffect(() => {
  const fetchAlerts = async () => {
    console.log("fetchAlerts called");
    try {
      const res = await fetch("http://10.132.20.218:5000/alert");
      console.log("fetch response", res);
      const alerts = await res.json();
      setAllAlerts(alerts);
      console.log("alerts json", alerts);

      if(alerts.length === 0) return;

      if(lastAlertId.current === null) {
        lastAlertId.current = Math.max(...alerts.map(a => a.ALERT_ID));
        return;
      }

      // Filter new alerts
      const newAlerts = alerts.filter(a => a.ALERT_ID > lastAlertId.current);
      console.log("New alerts detected: ", newAlerts);

      if (newAlerts.length > 0) {
        // Show a toast for each new alert
        newAlerts.forEach(alert => {
          Toast.show({
            type: alert.SEVERITY === "major" ? "error" : "info",
            position: "top",
            text1: `⚠️ ${alert.SEVERITY.toUpperCase()} ${alert.ALERT_TYPE} alert`,
            text2: `${alert.PNAME} is ${alert.HILO} (${alert.MAGNITUDE})`,
            visibilityTime: 4000,
            topOffset: 50,
          });
        });

        // Update lastAlertId to the latest one
        lastAlertId.current = Math.max(...alerts.map(a => a.ALERT_ID));
      }
    } catch (err) {
      console.error("Error polling alerts:", err);
    }
  };

  const interval = setInterval(fetchAlerts, 1000); // poll every 1s
  return () => clearInterval(interval);
}, []);

  return (
    <AlertContext.Provider value={{ allAlerts }}>
      {children}
      <Toast />
    </AlertContext.Provider>
  );
}

// optional hook if you ever need to access alert context later
export const useAlerts = () => useContext(AlertContext);
