import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState("");  

  const [modal, setModal] = useState({ show: false, esEditar: false });
  const [formulario, setFormulario] = useState({
    id: null,
    nombre: ""
  });

  useEffect(() => {
    listarCategorias();
  }, []);

  useEffect(() => {
    setCategoriasFiltradas(
      categorias.filter((categoria) =>
        categoria.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    );
  }, [busqueda, categorias]);

  const listarCategorias = async () => {
    const res = await api.get("/categorias/listar");
    setCategorias(res.data);
    setCategoriasFiltradas(res.data); 
  };

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setFormulario(categoria);
      setModal({ show: true, esEditar: true });
    } else {
      setFormulario({ id: null, nombre: "" });
      setModal({ show: true, esEditar: false });
    }
  };

  const cerrarModal = () => setModal({ ...modal, show: false });

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarCategoria = async () => {
    try {
      if (modal.esEditar) {
        await api.put(`/categorias/actualizar/${formulario.id}`, formulario);
        Swal.fire("Actualizado", "Categoría actualizada exitosamente", "success");
      } else {
        await api.post("/categorias/crear", formulario);
        Swal.fire("Creado", "Categoría creada exitosamente", "success");
      }
      cerrarModal();
      listarCategorias();
    } catch (err) {
      Swal.fire("Error", "Ocurrió un error al guardar", "error");
    }
  };

  const eliminarCategoria = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la categoría",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categorias/eliminar/${id}`);
        Swal.fire("Eliminada", "Categoría eliminada correctamente", "success");
        listarCategorias();
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Categorías</h2>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          Agregar Categoría
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar categoría por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categoriasFiltradas.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.nombre}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirModal(cat)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => eliminarCategoria(cat.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={`modal ${modal.show ? "d-block show" : ""}`} tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modal.esEditar ? "Editar Categoría" : "Nueva Categoría"}</h5>
              <button type="button" className="btn-close" onClick={cerrarModal}></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Nombre"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={guardarCategoria}>
                {modal.esEditar ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categorias;
