import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./styles/App.css";

import { Login } from "./pages/login.js";
import { Register } from "./pages/register.js";
import { Home } from "./pages/home.js";
import { Content } from "./pages/content.js";
import { Schedule } from "./pages/schedule.js";

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={isLogged ? <Home user={user} /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={
            isLogged ? (
              <Navigate to={"/"} />
            ) : (
              <Login
                onLogin={(user) => {
                  setIsLogged(true);
                  setUser(user);
                }}
              />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/content"
          element={
            isLogged ? <Content user={user} /> : <Navigate to={"/login"} />
          }
        />
        <Route
          path="/schedule"
          element={isLogged ? <Schedule /> : <Navigate to={"/login"} />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
