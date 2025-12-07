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
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="API SGT Online — Sistema de Gerenciamento de Tarefas com Node.js, Express e MongoDB." />
      <title>API SGT Online</title>

      <!-- Fonte moderna -->
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

      <style>
        body {
          margin: 0;
          padding: 40px;
          font-family: "Inter", sans-serif;
          background: #ffffff;
          color: #111827;
        }

        .container {
          max-width: 850px;
          margin: auto;
          text-align: center;
        }

        h1 {
          font-size: 2.6rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        p.subtitle {
          font-size: 1.1rem;
          color: #6b7280;
        }

        .links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 36px;
        }

        a.button {
          text-decoration: none;
          padding: 13px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          border: 1px solid #e5e7eb;
          background: #fafafa;
          color: #111;
          transition: all 0.25s ease;
        }

        a.button:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
        }

        .footer {
          margin-top: 45px;
          font-size: 0.85rem;
          color: #9ca3af;
        }

      </style>
    </head>

    <body>
      <div class="container">
        <h1>API SGT Online</h1>
        <p class="subtitle">Sistema de Gerenciamento de Tarefas — totalmente online<br> hospedado no Render e integrado ao MongoDB Atlas .</p>

        <div class="links">
          <a href="/api-docs" class="button">📘 Acessar (/api-docs)</a>
          <a href="/health-ui" class="button">🟢 Status da API</a>
          <a href="/health" class="button">🔎 Health JSON</a>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} — API SGT • Curso Dev Web.  
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Rota do health JSON cru.
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

// Rota status-ui
app.get("/health-ui", (_req, res) => {
  const mongoStatus = {
    0: "Desconectado",
    1: "Conectado",
    2: "Conectando",
    3: "Desconectando",
  };

  const mongoClass = {
    0: "bad",
    1: "good",
    2: "warn",
    3: "warn",
  };

  const html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="Status da API do Sistema de Gerenciamento de Tarefas. Verifique servidor, banco de dados e ambiente." />

      <title>Status da API</title>

      <style>
        :root {
          --bg: #f4f6f8;
          --card: #ffffff;
          --text: #111;
          --subtext: #6b7280;
          --good: #10b981;
          --bad: #ef4444;
          --warn: #f59e0b;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #0f172a;
            --card: #1e293b;
            --text: #f3f4f6;
            --subtext: #9ca3af;
          }
        }

        body {
          margin: 0;
          font-family: "Inter", sans-serif;
          background: var(--bg);
          color: var(--text);
          padding: 40px 20px;
        }

        h1 {
          text-align: center;
          font-size: 34px;
          margin-bottom: 35px;
        }

        .container {
          max-width: 750px;
          margin: 0 auto;
          display: grid;
          gap: 20px;
        }

        .card {
          background: var(--card);
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 22px rgba(0, 0, 0, 0.06);
          transition: transform .25s ease;
        }

        .card:hover {
          transform: translateY(-3px);
        }

        .label {
          font-size: 14px;
          color: var(--subtext);
        }

        .value {
          font-size: 20px;
          font-weight: 600;
          margin-top: 5px;
        }

        .good { color: var(--good); }
        .bad  { color: var(--bad); }
        .warn { color: var(--warn); }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          opacity: .8;
        }

        a {
          color: #3b82f6;
          text-decoration: none;
        }
      </style>
    </head>

    <body>
      <h1>Status da API</h1>

      <div class="container">

        <div class="card">
          <div class="label">Servidor</div>
          <div class="value good">Online ✓</div>
        </div>

        <div class="card">
          <div class="label">Data e hora</div>
          <div class="value">${new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })}</div>
        </div>

        <div class="card">
          <div class="label">Node.js</div>
          <div class="value">${process.version}</div>
        </div>

        <div class="card">
          <div class="label">MongoDB</div>
          <div class="value ${mongoClass[mongoose.connection.readyState]}">
            ${mongoStatus[mongoose.connection.readyState]}
          </div>
        </div>

        <div class="card">
          <div class="label">Porta do servidor</div>
          <div class="value">${process.env.PORT}</div>
        </div>

        <div class="card">
          <div class="label">Banco de dados (URI)</div>
          <div class="value" style="font-size: 15px; opacity: .8">Confidencial</div>
        </div>

      </div>

      <div class="footer">
        Exibir JSON completo: <a href="/health">/health</a>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

// Rota documentação swagger-ui
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rota de uploads
app.use("/uploads", express.static(uploadsDir));

// Rota de atenticação
app.use("/auth", authRoutes);

// Rota de usuários
app.use("/usuarios", usuariosRoutes);

// Rota de tarefas
app.use("/tarefas", tarefasRoutes);

// Rota de comentarios
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
