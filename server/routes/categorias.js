const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/listar", (req, res) => {
    db.query("SELECT * FROM categorias", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

router.post("/crear", (req, res) => {
    const { nombre } = req.body;
    db.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ id: result.insertId, nombre });
    });
});

router.put("/actualizar/:id", (req, res) => {
    const { nombre } = req.body;
    db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Categoría actualizada" });
    });
});

router.delete("/eliminar/:id", (req, res) => {
    db.query("DELETE FROM categorias WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Categoría eliminada" });
    });
});

module.exports = router;
