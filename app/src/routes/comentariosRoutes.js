import express from "express";
import mongoose from "mongoose";
import Comentario from "../models/Comentario.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comentario:
 *       type: object
 *       required:
 *         - texto
 *         - tarefa
 *       properties:
 *         _id:
 *           type: string
 *           description: ID do comentário
 *         texto:
 *           type: string
 *           description: Texto do comentário
 *         tarefa:
 *           type: string
 *           description: ID da tarefa relacionada
 *         comentarioPai:
 *           type: string
 *           description: ID do comentário pai (null se for raiz)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         texto: Este é um comentário de exemplo
 *         tarefa: 60d0fe4f5311236168a109ca
 *         comentarioPai: null
 */

/**
 * @swagger
 * /comentarios:
 *   post:
 *     summary: Cria um novo comentário
 *     tags: [Comentários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texto
 *               - tarefa
 *             properties:
 *               texto:
 *                 type: string
 *                 example: Este é um comentário
 *               tarefa:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109ca
 *               comentarioPai:
 *                 type: string
 *                 example: null
 *     responses:
 *       201:
 *         description: Comentário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *       400:
 *         description: Erro de validação
 */
router.post("/", async (req, res) => {
  const novoComentario = new Comentario(req.body);
  await novoComentario.save();
  res.status(201).json(novoComentario);
});

/**
 * @swagger
 * /comentarios/tarefa/{tarefaId}:
 *   get:
 *     summary: Lista comentários principais de uma tarefa
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: tarefaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Lista de comentários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comentario'
 *       500:
 *         description: Erro ao buscar comentários
 */
router.get("/tarefa/:tarefaId", async (req, res) => {
  const comentarios = await Comentario.find({
    tarefa: req.params.tarefaId,
    comentarioPai: null, // Apenas comentários raiz
  });
  res.json(comentarios);
});

/**
 * @swagger
 * /comentarios/{comentarioId}/respostas:
 *   get:
 *     summary: Lista respostas de um comentário
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Lista de respostas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comentario'
 *       500:
 *         description: Erro ao buscar respostas
 */
router.get("/:comentarioId/respostas", async (req, res) => {
  const respostas = await Comentario.find({
    comentarioPai: req.params.comentarioId,
  });
  res.json(respostas);
});

/**
 * @swagger
 * /comentarios/{comentarioId}/arvore:
 *   get:
 *     summary: Busca um comentário com toda sua árvore de respostas (usando $graphLookup)
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Comentário com árvore de respostas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *       404:
 *         description: Comentário não encontrado
 *       500:
 *         description: Erro ao buscar árvore
 */
router.get("/:comentarioId/arvore", async (req, res) => {
  const resultado = await Comentario.aggregate([
    // Passo 1: Encontrar o comentário raiz
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.comentarioId),
      },
    },
    // Passo 2: Buscar recursivamente todos os descendentes
    {
      $graphLookup: {
        from: "comentarios", // Nome da coleção no MongoDB
        startWith: "$_id", // Começar pelo ID do comentário atual
        connectFromField: "_id", // Campo que conecta próximo nível
        connectToField: "comentarioPai", // Campo que indica o pai
        as: "respostas", // Campo onde as respostas serão armazenadas
        maxDepth: 10, // Profundidade máxima (evita loops infinitos)
      },
    },
  ]);
  if (resultado.length === 0) {
    return res.status(404).json({ erro: "Comentário não encontrado." });
  }
  res.json(resultado[0]);
});

// Função auxiliar recursiva
async function buscarComentariosComRespostas(comentarioId) {
  // Buscar o comentário principal
  const comentario = await Comentario.findById(comentarioId).lean();
  if (!comentario) {
    return null;
  }
  // Buscar todas as respostas diretas deste comentário
  const respostas = await Comentario.find({
    comentarioPai: comentarioId,
  }).lean();

  // Para cada resposta, buscar recursivamente suas próprias respostas
  comentario.respostas = await Promise.all(
    respostas.map((resposta) => buscarComentariosComRespostas(resposta._id))
  );

  return comentario;
}

/**
 * @swagger
 * /comentarios/{comentarioId}/arvore-aninhada:
 *   get:
 *     summary: Busca um comentário com árvore aninhada de respostas (usando recursão)
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Comentário com árvore aninhada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *       404:
 *         description: Comentário não encontrado
 *       500:
 *         description: Erro ao buscar árvore
 */
router.get("/:comentarioId/arvore-aninhada", async (req, res) => {
  const arvore = await buscarComentariosComRespostas(req.params.comentarioId);
  if (!arvore) {
    return res.status(404).json({ erro: "Comentário não encontrado." });
  }
  res.json(arvore);
});

export default router;
