import express from "express";
import "express-async-errors"; // Importar no topo
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import swaggerUi from "swagger-ui-express";

import logger from "./config/logger.js"; // Importar logger
import swaggerSpecs from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import tarefasRoutes from "./routes/tarefasRoutes.js";
import comentariosRoutes from "./routes/comentariosRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0";
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/curso";

// Logs úteis
console.log(
  "[BOOT] NODE_ENV=%s, PORT=%s, MONGODB_URI=%s",
  process.env.NODE_ENV,
  port,
  uri
);

// Conexão Mongo
(async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
  console.log("[MONGO] Conectado com sucesso.");
})();

// Criar dir de uploads
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// healthcheck
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    node: process.version,
    mongoReady: mongoose.connection.readyState,
    env: {
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI,
    },
  });
});

// Rota principal
app.get("/", (_req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-br">
      <head>
        <meta charset="UTF-8" />
        <title>API-SGT</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f7fc;
            color: #333;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }

          .container {
            background: #fff;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
            width: 420px;
            animation: fadeIn 0.6s ease-in-out;
          }

          h1 {
            margin-bottom: 10px;
            font-size: 26px;
            color: #1a73e8;
          }

          p {
            margin: 10px 0 20px;
            font-size: 18px;
          }

          a {
            color: white;
            background: #1a73e8;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            transition: 0.3s;
          }

          a:hover {
            background: #155fb8;
          }

          .footer {
            margin-top: 20px;
            font-size: 13px;
            color: #666;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </head>

      <body>
        <div class="container">
          <h1>API Gerenciador de Tarefas</h1>
          <p><strong>Status do servidor:</strong></p>

          <a href="/health">Verificar /health</a>

          <p class="footer">API hospedada no Render • MongoDB • JWT Auth</p>
        </div>
      </body>
    </html>
  `;

  res.send(html);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/uploads", express.static(uploadsDir));
app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/tarefas", tarefasRoutes);
app.use("/comentarios", comentariosRoutes);

app.use((err, req, res) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(500).json({ erro: "Ocorreu um erro inesperado no servidor." });
});

// Handler global
process.on("unhandledRejection", (err) => {
  console.error("[UNHANDLED REJECTION]", err);
});

// 👉 **Export deve ficar ANTES do listen**
export default app;

// 👉 **listen rodando sempre (exceto test)**
if (process.env.NODE_ENV !== "test") {
  app.listen(port, host, () => {
    console.log(`[BOOT] Servidor ouvindo em http://${host}:${port}`);
  });
}
