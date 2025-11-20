// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// =======================
//  CORS
// =======================
//
// FRONTEND_ORIGIN debe ser algo como:
// - http://localhost:3000  (desarrollo)
// - https://tu-dominio-frontend.com  (producción)
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";

app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.use(express.json());

// =======================
//  TRANSPORTER NODEMAILER
// =======================
//
// Variables que usaremos en Render:
// MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_TO
//
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT) === 465, // true si usas 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Ruta de prueba rápida
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API de contacto funcionando 👌" });
});

// =======================
//  RUTA DE CONTACTO
// =======================
app.post("/api/contact", async (req, res) => {
  try {
    const { nombre, correo, mensaje, trap } = req.body;

    // Honeypot anti-spam
    if (trap) {
      return res.status(200).json({ ok: true, message: "OK (trap)" });
    }

    if (!correo || !mensaje) {
      return res
        .status(400)
        .json({ ok: false, message: "Correo y mensaje son obligatorios" });
    }

    const subject = `Contacto desde portafolio - ${nombre || "Sin nombre"}`;
    const textBody = `${mensaje}\n\n— ${nombre || "Anónimo"} (${correo})`;

    const mailOptions = {
      from: `"Portafolio Hilston Will" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: correo,
      subject,
      text: textBody,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ ok: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al enviar el mensaje" });
  }
});

// =======================
//  ARRANQUE
// =======================
//
// Render define la variable PORT automáticamente.
// En local usaremos 4000 si no existe.
//
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
