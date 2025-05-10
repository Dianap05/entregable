import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";

const Ventas = () => {
  const [productos, setProductos] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [total, setTotal] = useState(0);
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [stockBajo, setStockBajo] = useState([]);

  useEffect(() => {
    listarProductos();
    listarVentas();
    validarStockBajo();
  }, []);

  const listarProductos = async () => {
    const res = await api.get("/productos/listar");
    setProductos(res.data);
  };

  const listarVentas = async () => {
    try {
      const res = await api.get("/ventas/listar");
      setVentas(res.data);
    } catch (err) {
      console.error("Error al listar ventas", err);
    }
  };

  const validarStockBajo = async () => {
    try {
      const res = await api.get("/ventas/validar-stock");
  
      if (res.data && Array.isArray(res.data.productos)) {
        if (res.data.productos.length > 0) {
          setStockBajo(res.data.productos);
          Swal.fire(
            "Stock Bajo",
            `Los siguientes productos tienen stock bajo: ${res.data.productos
              .join(", ")}`,
            "info"
          );
        }
      } else {
        console.error("La respuesta no tiene la estructura esperada:", res.data);
      }
    } catch (err) {
      console.error("Error al validar el stock", err);
      Swal.fire("Error", "Ocurrió un error al validar el stock.", "error");
    }
  };
  
  

  const agregarFila = () => {
    setDetalleVenta([
      ...detalleVenta,
      { producto_id: "", cantidad: "1", precio_unitario: 0 },
    ]);
  };

  const eliminarFila = (index) => {
    const newDetalleVenta = [...detalleVenta];
    newDetalleVenta.splice(index, 1);
    setDetalleVenta(newDetalleVenta);
  };

  const handleChangeDetalle = (e, index) => {
    const { name, value } = e.target;
    const newDetalleVenta = [...detalleVenta];

    if (name === "cantidad") {
      if (parseInt(value) <= 0 || isNaN(parseInt(value))) {
        Swal.fire("Cantidad inválida", "La cantidad debe ser mayor a cero", "warning");
        return;
      }
    }

    newDetalleVenta[index] = {
      ...newDetalleVenta[index],
      [name]: value,
    };

    if (name === "producto_id") {
      const producto = productos.find((prod) => prod.id === parseInt(value));
      newDetalleVenta[index].precio_unitario = producto ? producto.precio : 0;
    }

    setDetalleVenta(newDetalleVenta);
  };

  useEffect(() => {
    calcularTotal();
  }, [detalleVenta]);

  const calcularTotal = () => {
    const newTotal = detalleVenta.reduce((acc, item) => {
      const cantidad = parseFloat(item.cantidad);
      const precio = parseFloat(item.precio_unitario);
      const subtotal = cantidad * precio;
      return acc + (isNaN(subtotal) ? 0 : subtotal);
    }, 0);
    setTotal(newTotal);
  };

  const guardarVenta = async () => {
    const detalleValido = detalleVenta.filter(
      (item) => item.producto_id && parseInt(item.cantidad) > 0
    );

    const totalValido = detalleValido.reduce((acc, item) => {
      return acc + item.precio_unitario * item.cantidad;
    }, 0);

    if (detalleValido.length === 0 || totalValido <= 0) {
      Swal.fire("Error", "Agregue al menos un producto válido para registrar la venta", "warning");
      return;
    }

    let stockBajoProductos = [];
    for (const item of detalleValido) {
      const producto = productos.find((prod) => prod.id === parseInt(item.producto_id));
      if (producto) {
        if (producto.stock < item.cantidad) {
          stockBajoProductos.push(producto);
        } else if (producto.stock < 5) {
          Swal.fire(
            "Stock bajo",
            `El producto "${producto.nombre}" tiene un stock bajo (${producto.stock} unidades).`,
            "info"
          );
        }
      }
    }

    if (stockBajoProductos.length > 0) {
      setStockBajo(stockBajoProductos);
      return;
    }

    const venta = { total: totalValido, detalle: detalleValido };

    try {
      await api.post("/ventas/crear", venta);
      Swal.fire("Venta registrada", "La venta se ha registrado exitosamente", "success");
      setDetalleVenta([]);
      setTotal(0);
      listarVentas();
    } catch (err) {
      Swal.fire("Error", "Ocurrió un error al registrar la venta", "error");
    }
    
  };

  const verDetalleVenta = async (id) => {
    try {
      const res = await api.get(`/ventas/detalle/${id}`);
      setVentaSeleccionada(res.data);
      setMostrarModal(true);
    } catch (err) {
      Swal.fire("Error", "No se pudo obtener los detalles de la venta", "error");
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setVentaSeleccionada(null);
  };

  const cerrarStockBajoModal = () => {
    setStockBajo([]);
  };

  return (
    <div className="container mt-4">
      <h2>Ventas</h2>

      <div className="mb-3">
        <button className="btn btn-primary" onClick={agregarFila}>
          Agregar Producto
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalleVenta.map((item, index) => (
            <tr key={index}>
              <td>
                <select
                  className="form-select"
                  name="producto_id"
                  value={item.producto_id}
                  onChange={(e) => handleChangeDetalle(e, index)}
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  name="cantidad"
                  value={item.cantidad || 1}
                  onChange={(e) => handleChangeDetalle(e, index)}
                />
              </td>
              <td>S/ {item.precio_unitario}</td>
              <td>
                S/{" "}
                {item.producto_id && item.cantidad
                  ? item.cantidad * item.precio_unitario
                  : 0}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarFila(index)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-between">
        <h5>Total: S/ {total}</h5>
        <button className="btn btn-success" onClick={guardarVenta}>
          Registrar Venta
        </button>
      </div>

      <hr />

      <h3 className="mt-5">Historial de Ventas</h3>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.id}</td>
              <td>S/ {venta.total}</td>
              <td>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => verDetalleVenta(venta.id)}
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={mostrarModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventaSeleccionada ? (
            <>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaSeleccionada.map((detalle) => (
                    <tr key={detalle.id}>
                      <td>{detalle.producto}</td>
                      <td>{detalle.cantidad}</td>
                      <td>S/ {detalle.precio}</td>
                      <td>S/ {detalle.cantidad * detalle.precio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-end">
                <h5>
                  Total de la Venta: S/{" "}
                  {ventaSeleccionada.reduce(
                    (acc, detalle) => acc + detalle.cantidad * detalle.precio,
                    0
                  )}
                </h5>
              </div>
            </>
          ) : (
            <p>Cargando detalles...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={cerrarModal}>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Ventas;
