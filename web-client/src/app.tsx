import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import { USE_BROWSER_ROUTER } from "./common/constants";
import NotFound from "./pages/not-found";
import "./styles/app.scss";
import DashboardPage from "./pages/dashboard/dashboard-page";
import ChatFab from "./components/chat-widget/chat-fab";
import ChatWidget from "./components/chat-widget/chat-widget";
import { GeneralProvider } from "./context/general-context";
import ToolListPage from "./pages/tool-list/tool-list-page";
import ToolSessionPage from "./pages/tool-session/tool-session-page";
import ToolOutputPage from "./pages/tool-session/tool-output-page";

export default function App() {
  const Router = USE_BROWSER_ROUTER ? BrowserRouter : HashRouter;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Router>
        <GeneralProvider>
          <Routes>
            <Route index path="/" element={<DashboardPage />} />
            <Route
              path="/tool-list"
              element={<ToolListPage />}
            />
            <Route path="/tool-session" element={<ToolSessionPage />} />
            <Route
              path="/tool-out/:sessionId/:toolId"
              element={<ToolOutputPage />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatFab />
          <ChatWidget />
        </GeneralProvider>
      </Router>
    </div>
  );
}
