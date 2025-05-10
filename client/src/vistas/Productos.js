import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");  

  const [modal, setModal] = useState({ show: false, esEditar: false });
  const [formulario, setFormulario] = useState({
    id: null,
    nombre: "",
    stock: "",
    precio: "",
    categoria_id: ""
  });

  useEffect(() => {
    listarProductos();
    listarCategorias();
  }, []);

  useEffect(() => {
    setProductosFiltrados(
      productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    );
  }, [busqueda, productos]);

  const listarProductos = async () => {
    const res = await api.get("/productos/listar");
    setProductos(res.data);
    setProductosFiltrados(res.data);  
  };

  const listarCategorias = async () => {
    const res = await api.get("/categorias/listar");
    setCategorias(res.data);
  };

  const abrirModal = (producto = null) => {
    if (producto) {
      setFormulario(producto);
      setModal({ show: true, esEditar: true });
    } else {
      setFormulario({ id: null, nombre: "", stock: "", precio: "", categoria_id: "" });
      setModal({ show: true, esEditar: false });
    }
  };

  const cerrarModal = () => setModal({ ...modal, show: false });

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarProducto = async () => {
    try {
      if (modal.esEditar) {
        await api.put(`/productos/actualizar/${formulario.id}`, formulario);
        Swal.fire("Actualizado", "Producto actualizado exitosamente", "success");
      } else {
        await api.post("/productos/crear", formulario);
        Swal.fire("Creado", "Producto creado exitosamente", "success");
      }
      cerrarModal();
      listarProductos();
    } catch (err) {
      Swal.fire("Error", "Ocurrió un error al guardar", "error");
    }
  };

  const eliminarProducto = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/productos/eliminar/${id}`);
        Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
        listarProductos();
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Productos</h2>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          Agregar Producto
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar producto por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>{prod.nombre}</td>
              <td>{prod.stock}</td>
              <td>S/ {prod.precio}</td>
              <td>{prod.categoria}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirModal(prod)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => eliminarProducto(prod.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <div className={`modal ${modal.show ? "d-block show" : ""}`} tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modal.esEditar ? "Editar Producto" : "Nuevo Producto"}</h5>
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
              <input
                type="number"
                className="form-control mb-3"
                placeholder="Stock"
                name="stock"
                value={formulario.stock}
                onChange={handleChange}
              />
              <input
                type="number"
                className="form-control mb-3"
                placeholder="Precio"
                name="precio"
                value={formulario.precio}
                onChange={handleChange}
              />
              <select
                className="form-select mb-3"
                name="categoria_id"
                value={formulario.categoria_id}
                onChange={handleChange}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={guardarProducto}>
                {modal.esEditar ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productos;
