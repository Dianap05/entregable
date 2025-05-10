const mysql = require("mysql");

const db = mysql.createConnection({
    host: "host.docker.internal",
    user: "root",
    password: "",
    database: "proyectofinal"
});

db.connect((err) => {
    if (err) {
        console.error("❌ Error al conectar a MySQL:", err);
    } else {
        console.log("✅ Conectado a MySQL");
    }
});

module.exports = db;
