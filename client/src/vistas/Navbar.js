import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary bg-gradient shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/productos">
          Nova Salud
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto gap-3">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/productos">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/categorias">Categorías</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/ventas">Ventas</Link>
            </li>
          </ul>
          <button
            className="btn btn-outline-light btn-sm ms-auto"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
