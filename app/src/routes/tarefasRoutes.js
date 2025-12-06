import express from "express";
import Tarefa from "../models/Tarefa.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Aplicar o middleware a todas as rotas de tarefas
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Tarefa:
 *       type: object
 *       required:
 *         - titulo
 *         - prioridade
 *       properties:
 *         _id:
 *           type: string
 *           description: ID da tarefa
 *         titulo:
 *           type: string
 *           description: Título da tarefa
 *         prioridade:
 *           type: string
 *           enum: [Baixa, Média, Alta]
 *           description: Prioridade da tarefa
 *         concluida:
 *           type: boolean
 *           description: Status da tarefa
 *           default: false
 *         usuario:
 *           type: string
 *           description: ID do usuário proprietário
 *         anexo:
 *           type: string
 *           description: Caminho do anexo único
 *         anexos:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de caminhos dos anexos
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         titulo: Comprar pão
 *         prioridade: Média
 *         concluida: false
 *         usuario: 60d0fe4f5311236168a109c9
 */

/**
 * @swagger
 * /tarefas:
 *   get:
 *     summary: Lista todas as tarefas do usuário autenticado
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarefa'
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro ao buscar tarefas
 */
router.get("/", async (req, res) => {
  const tarefas = await Tarefa.find({ usuario: req.usuarioId });
  res.json(tarefas);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   get:
 *     summary: Busca uma tarefa por ID
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarefa'
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro ao buscar tarefa
 */
router.get("/:id", async (req, res) => {
  const tarefa = await Tarefa.findById(req.params.id).populate("usuario");
  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }
  res.json(tarefa);
});

/**
 * @swagger
 * /tarefas:
 *   post:
 *     summary: Cria uma nova tarefa para o usuário autenticado
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - prioridade
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Comprar pão
 *               prioridade:
 *                 type: string
 *                 enum: [Baixa, Média, Alta]
 *                 example: Média
 *               concluida:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarefa'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.post("/", async (req, res) => {
  //const novaTarefa = new Tarefa(req.body);
  const novaTarefa = new Tarefa({ ...req.body, usuario: req.usuarioId });

  await novaTarefa.save();
  res.status(201).json(novaTarefa);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Comprar leite
 *               prioridade:
 *                 type: string
 *                 enum: [Baixa, Média, Alta]
 *                 example: Alta
 *               concluida:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarefa'
 *       404:
 *         description: Tarefa não encontrada
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.put("/:id", async (req, res) => {
  const tarefaAtualizada = await Tarefa.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!tarefaAtualizada) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }

  res.json(tarefaAtualizada);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   delete:
 *     summary: Deleta uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       204:
 *         description: Tarefa deletada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro ao deletar tarefa
 */
router.delete("/:id", async (req, res) => {
  const tarefaDeletada = await Tarefa.findByIdAndDelete(req.params.id);
  if (!tarefaDeletada) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }
  res.status(204).send();
});

/**
 * @swagger
 * /tarefas/{id}/anexo:
 *   post:
 *     summary: Faz upload de um anexo único para a tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               anexo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo a ser enviado
 *     responses:
 *       200:
 *         description: Anexo enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 anexo:
 *                   type: object
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro ao enviar anexo
 */
router.post("/:id/anexo", upload.single("anexo"), async (req, res) => {
  const tarefa = await Tarefa.findById(req.params.id);
  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }

  tarefa.anexo = req.file.path;
  await tarefa.save();

  res.json({ mensagem: "Anexo enviado com sucesso!", anexo: req.file });
});

/**
 * @swagger
 * /tarefas/{id}/anexos:
 *   post:
 *     summary: Faz upload de múltiplos anexos para a tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               anexos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Arquivos a serem enviados (máximo 5)
 *     responses:
 *       200:
 *         description: Anexos enviados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 anexos:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro ao enviar anexos
 */
router.post("/:id/anexos", upload.array("anexos", 5), async (req, res) => {
  const tarefa = await Tarefa.findById(req.params.id);
  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }

  const caminhos = req.files.map((file) => file.path);
  tarefa.anexos = tarefa.anexos ? tarefa.anexos.concat(caminhos) : caminhos;
  await tarefa.save();

  res.json({ mensagem: "Anexos enviados com sucesso!", anexos: req.files });
});

export default router;
