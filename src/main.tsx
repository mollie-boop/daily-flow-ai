import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeStorage } from "./lib/storage";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Initialize storage and run migrations
initializeStorage();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
