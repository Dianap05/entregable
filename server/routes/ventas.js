const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.post("/crear", (req, res) => {
    const { total, detalle } = req.body;

    const stockCheckPromises = detalle.map(item => {
        return new Promise((resolve, reject) => {
            db.query("SELECT stock FROM productos WHERE id = ?", [item.producto_id], (err, results) => {
                if (err) return reject(err); 

                const stock = results[0].stock;
                if (stock < item.cantidad) {
                    reject(`Stock insuficiente para el producto ID ${item.producto_id}. Solo hay ${stock} unidades disponibles.`);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(stockCheckPromises)
        .then(() => {
            db.beginTransaction(err => {
                if (err) return res.status(500).json(err);

                db.query("INSERT INTO ventas (total) VALUES (?)", [total], (err, result) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json(err));
                    }

                    const ventaId = result.insertId;

                    const detallesInsert = detalle.map(item => [
                        ventaId,
                        item.producto_id,
                        item.cantidad,
                        item.precio_unitario || 0
                    ]);

                    db.query(
                        "INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES ?",
                        [detallesInsert],
                        (err) => {
                            if (err) {
                                return db.rollback(() => res.status(500).json(err));
                            }

                            const updates = detalle.map(item => {
                                return new Promise((resolve, reject) => {
                                    db.query(
                                        "UPDATE productos SET stock = stock - ? WHERE id = ?",
                                        [item.cantidad, item.producto_id],
                                        (err) => {
                                            if (err) reject(err);
                                            else resolve();
                                        }
                                    );
                                });
                            });

                            Promise.all(updates)
                                .then(() => {
                                    db.commit(err => {
                                        if (err) return db.rollback(() => res.status(500).json(err));
                                        res.json({ message: "Venta registrada con detalle" });
                                    });
                                })
                                .catch(err => db.rollback(() => res.status(500).json(err)));
                        }
                    );
                });
            });
        })
        .catch(error => {
            res.status(400).json({ error });
        });
});


router.get("/listar", (req, res) => {
    db.query("SELECT * FROM ventas", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

router.get("/detalle/:id", (req, res) => {
    const { id } = req.params;
    db.query(
        `SELECT dv.*, p.nombre AS producto, p.precio 
         FROM detalle_ventas dv 
         JOIN productos p ON dv.producto_id = p.id 
         WHERE dv.venta_id = ?`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});
router.get("/validar-stock", (req, res) => {
    const umbralStockBajo = 5;

    db.query("SELECT nombre, stock FROM productos WHERE stock < ?", [umbralStockBajo], (err, results) => {
        if (err) return res.status(500).json({ error: "Error al consultar la base de datos." });

        if (results.length > 0) {
            const productosConStockBajo = results.map(producto => producto.nombre);
            res.json({
                message: "Alerta de stock bajo",
                productos: productosConStockBajo
            });
        } else {
            res.json({
                message: "Stock suficiente para todos los productos",
                productos: []
            });
        }
    });
});



module.exports = router;
