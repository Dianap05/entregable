const express = require("express");
const router = express.Router();
const db = require("../db/db"); 
router.post("/login", (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    db.query(
        "SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?",
        [correo, contraseña],
        (err, results) => {
            if (err) return res.status(500).json(err);

            if (results.length === 0) {
                return res.status(401).json({ message: "Credenciales incorrectas" });
            }

            res.json({ message: "Login exitoso", usuario: results[0] });
        }
    );
});

module.exports = router; 
