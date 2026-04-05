import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.css";
import { Login } from "./pages/login.js";
import { Register } from "./pages/register.js";
import { Home } from "./pages/home.js";
import { useState } from "react";

function App() {
  const [isLogged, setIsLogged] = useState(false);

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={isLogged ? <Home /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={
            isLogged ? (
              <Navigate to={"/"} />
            ) : (
              <Login onLogin={() => setIsLogged(true)} />
            )
          }
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
