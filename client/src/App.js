import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./vistas/Login";
import Productos from "./vistas/Productos";
import Categorias from "./vistas/Categorias";
import Ventas from "./vistas/Ventas";
import Navbar from "./vistas/Navbar";

function App() {
  const [autenticado, setAutenticado] = useState(false); 

  const handleLogin = () => {
    setAutenticado(true); 
  };

  return (
    <Router>
      {autenticado && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        {autenticado ? (
          <>
            <Route path="/productos" element={<Productos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="*" element={<Navigate to="/productos" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
