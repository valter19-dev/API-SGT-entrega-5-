import swaggerJsdoc from "swagger-jsdoc"; 

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Tarefas com MongoDB",
      version: "1.0.0",
      description: "Documentação da API de Tarefas com MongoDB",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Caminho para os arquivos de rotas
};
 
const specs = swaggerJsdoc(options);
export default specs;
