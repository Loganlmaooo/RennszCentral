import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Providers } from "./components/Providers";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <App />
  </Providers>
);
