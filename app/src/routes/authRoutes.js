import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import enviarEmail from "../services/emailService.js"; // Importar

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *       properties:
 *         _id:
 *           type: string
 *           description: ID do usuário
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário (hash)
 *       example:
 *         nome: João Silva
 *         email: joao@example.com
 *         senha: senha123
 */

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Usuário registrado com sucesso!
 *       400:
 *         description: Erro ao registrar usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 */
router.post("/registro", async (req, res) => {
  const { nome, email, senha } = req.body;

  // Gera hash da senha
  const senhaHash = await bcrypt.hash(senha, 10);

  // Cria usuário com senha criptografada
  const novoUsuario = new Usuario({
    nome,
    email,
    senha: senhaHash,
  });

  await novoUsuario.save();

  // Enviar e-mail de boas-vindas
  const assunto = "Bem-vindo à nossa API de Tarefas!";
  const corpo = `<h1>Olá, ${nome}!</h1><p>Seu cadastro foi realizado com sucesso.</p>`;
  await enviarEmail(email, assunto, corpo);

  res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Faz login e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: Credenciais inválidas.
 *       500:
 *         description: Erro ao fazer login
 */
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await Usuario.findOne({ email }).select("+senha");
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  const token = jwt.sign(
    { id: usuario._id, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

export default router;
