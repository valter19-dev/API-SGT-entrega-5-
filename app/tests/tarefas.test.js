import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index.js";
import Usuario from "../src/models/Usuario.js";
import Tarefa from "../src/models/Tarefa.js";
import jwt from "jsonwebtoken";

describe("Testes das Rotas de Tarefas", () => {
  let token;
  let usuarioId;

  beforeAll(async () => {
    // Aguardar a conexão do index.js estar pronta
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Limpar dados anteriores
    await Usuario.deleteMany({});
    await Tarefa.deleteMany({});

    // Criar um usuário de teste e gerar token
    const usuario = new Usuario({
      nome: "Usuario Teste",
      email: "teste@teste.com",
      senha: "senha123",
    });
    await usuario.save();
    usuarioId = usuario._id;

    // Gerar token JWT
    token = jwt.sign(
      { id: usuario._id, nome: usuario.nome },
      process.env.JWT_SECRET || "chave_secreta_teste",
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // Limpar apenas os dados de teste
    // await Usuario.deleteMany({});
    // await Tarefa.deleteMany({});
  });

  it("Deve retornar uma lista vazia de tarefas", async () => {
    const res = await request(app)
      .get("/tarefas")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  let tarefaId;
  it("Deve criar uma nova tarefa", async () => {
    const res = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Tarefa de Teste",
        prioridade: "Alta",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.titulo).toBe("Tarefa de Teste");
    tarefaId = res.body._id;
  });

  it("Deve buscar a tarefa criada", async () => {
    const res = await request(app)
      .get(`/tarefas/${tarefaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.titulo).toBe("Tarefa de Teste");
  });

  it("Deve atualizar a tarefa criada", async () => {
    const res = await request(app)
      .put(`/tarefas/${tarefaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ concluida: true });

    expect(res.statusCode).toEqual(200);
    expect(res.body.concluida).toBe(true);
  });

  it("Deve deletar a tarefa criada", async () => {
    const res = await request(app)
      .delete(`/tarefas/${tarefaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});
