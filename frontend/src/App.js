import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./styles/App.css";

import { LoginPage } from "./pages/LoginPage.js";
import { UserRegister } from "./pages/UserRegister.js";
import { HomePage } from "./pages/HomePage.js";
import { ContentRegister } from "./pages/ContentRegister.js";
import { ScheduleRegister } from "./pages/ScheduleRegister.js";
import { StatsPage } from "./pages/StatsPage.js";

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={isLogged ? <HomePage user={user} /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={isLogged ? ( <Navigate to={"/"} /> ) : ( <LoginPage onLogin={(user) => { setIsLogged(true); setUser(user); }} />)} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/content" element={isLogged ? <ContentRegister user={user} /> : <Navigate to={"/login"} />} />
        <Route path="/schedule" element={isLogged ? <ScheduleRegister user={user} /> : <Navigate to={"/login"} />} />
        <Route path="/stats" element={isLogged ? <StatsPage user={user} /> : <Navigate to={"/login"} />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
