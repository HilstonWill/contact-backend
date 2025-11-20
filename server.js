// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

/**
 * Orígenes permitidos (tu frontend en Netlify y localhost para pruebas)
 */
const allowedOrigins = [
  "https://hilston-will.netlify.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite también herramientas tipo Postman (sin origin)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

/**
 * Configuración de Nodemailer con variables de entorno
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false, // true solo si usas 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Ruta simple para comprobar que el servicio vive
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API de contacto funcionando" });
});

/**
 * POST /api/contact
 * Body esperado:
 * {
 *   nombre: string,
 *   correo: string,
 *   mensaje: string,
 *   trap: string (honeypot)
 * }
 */
app.post("/", async (req, res) => {
  try {
    const { nombre, correo, mensaje, trap } = req.body;

    // Honeypot anti-spam
    if (trap) {
      return res.status(200).json({ ok: true, message: "OK (bot ignorado)" });
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
      replyTo: correo, // al responder, te responde directo al correo del usuario
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

/**
 * Render asigna el puerto en process.env.PORT
 */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
