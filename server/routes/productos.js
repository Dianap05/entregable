const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/listar", (req, res) => {
    db.query("SELECT p.*, c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.estado = 1", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

router.post("/crear", (req, res) => {
    const { nombre, stock, precio, categoria_id } = req.body;
    db.query("INSERT INTO productos (nombre, stock, precio, categoria_id) VALUES (?, ?, ?, ?)",
        [nombre, stock, precio, categoria_id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId, nombre });
        });
});

router.put("/actualizar/:id", (req, res) => {
    const { nombre, stock, precio, categoria_id } = req.body;
    db.query("UPDATE productos SET nombre = ?, stock = ?, precio = ?, categoria_id = ? WHERE id = ?",
        [nombre, stock, precio, categoria_id, req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Producto actualizado" });
        });
});

router.delete("/eliminar/:id", (req, res) => {
    db.query("UPDATE productos SET estado = 0 WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Producto eliminado lógicamente" });
    });
});

module.exports = router;
