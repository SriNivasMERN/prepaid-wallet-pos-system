/**
 * Module: Root Application
 * File: App.jsx
 * Purpose: Connects the top-level router to the React application.
 */

import { BrowserRouter } from "react-router-dom";

import AppRouter from "./routes/AppRouter";

/**
 * Wraps the route tree with the browser router.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;