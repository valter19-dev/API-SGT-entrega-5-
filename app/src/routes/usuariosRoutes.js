import express from "express";
import Usuario from "../models/Usuario.js";

const router = express.Router();

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria um novo usuário (sem autenticação)
 *     tags: [Usuários]
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
 *                 example: Maria Santos
 *               email:
 *                 type: string
 *                 example: maria@example.com
 *               senha:
 *                 type: string
 *                 example: senha456
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Erro de validação
 */
router.post("/", async (req, res) => {
  const novoUsuario = new Usuario(req.body);
  await novoUsuario.save();
  res.status(201).json(novoUsuario);
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Erro ao buscar usuários
 */
router.get("/", async (req, res) => {
  const usuarios = await Usuario.find({});
  res.json(usuarios);
});

export default router;
