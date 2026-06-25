import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/App.css";

import { LoginPage } from "./pages/LoginPage.js";
import { UserRegister } from "./pages/UserRegister.js";
import { HomePage } from "./pages/HomePage.js";
import { ContentRegister } from "./pages/ContentRegister.js";
import { ScheduleRegister } from "./pages/ScheduleRegister.js";
import { StatsPage } from "./pages/StatsPage.js";
import { api } from "./services/api.js";

function App() {
  const [isLogged, setIsLogged] = useState(Boolean(localStorage.getItem("gestaoEstudosToken")));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("gestaoEstudosUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [checkingSession, setCheckingSession] = useState(Boolean(localStorage.getItem("gestaoEstudosToken")));

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem("gestaoEstudosToken");
      if (!token) {
        if (active) {
          setCheckingSession(false);
        }
        return;
      }

      try {
        const currentUser = await api.me();
        if (!active) {
          return;
        }

        localStorage.setItem("gestaoEstudosUser", JSON.stringify(currentUser));
        setUser(currentUser);
        setIsLogged(true);
      } catch (_) {
        localStorage.removeItem("gestaoEstudosToken");
        localStorage.removeItem("gestaoEstudosUser");
        if (active) {
          setUser(null);
          setIsLogged(false);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  function handleLogin(authData) {
    localStorage.setItem("gestaoEstudosToken", authData.token);
    localStorage.setItem("gestaoEstudosUser", JSON.stringify(authData.user));
    setIsLogged(true);
    setUser(authData.user);
  }

  function handleLogout() {
    localStorage.removeItem("gestaoEstudosToken");
    localStorage.removeItem("gestaoEstudosUser");
    setIsLogged(false);
    setUser(null);
  }

  if (checkingSession) {
    return <div className="home-page">Carregando sessão...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={isLogged ? <HomePage user={user} onLogout={handleLogout} /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={isLogged ? <Navigate to={"/"} /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/content" element={isLogged ? <ContentRegister user={user} /> : <Navigate to={"/login"} />} />
        <Route path="/schedule" element={isLogged ? <ScheduleRegister user={user} /> : <Navigate to={"/login"} />} />
        <Route path="/stats" element={isLogged ? <StatsPage user={user} /> : <Navigate to={"/login"} />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
