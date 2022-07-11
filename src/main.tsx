import { createRoot } from "react-dom/client";
import { App } from "./App";

import "../styles/style.css";

const rootElement = document.getElementById('root');
if (rootElement === null)
    throw new Error("ERROR!");
const root = createRoot(rootElement);
root.render(<App />);