import React, { useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/usuarios/login", {
        correo,
        contraseña,
      });

      Swal.fire("Bienvenido", res.data.message, "success").then(() => {
        onLogin();              
        navigate("/productos"); 
      });
    } catch (err) {
      Swal.fire("Error", "Correo o contraseña inválidos", "error");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Login</h2>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-100" onClick={handleLogin}>
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
