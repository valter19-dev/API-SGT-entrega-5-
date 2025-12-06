import mongoose from "mongoose";

const tarefaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "O campo título é obrigatório."],
      trim: true,
      validate: {
        validator: function (v) {
          // Não permite o título "Tarefa"
          return v.toLowerCase() !== "tarefa";
        },
        message: (props) => `${props.value} não é um título válido!`,
      },
    },
    concluida: { type: Boolean, default: false },

    prioridade: {
      type: String,
      required: true,
      enum: ["Baixa", "Média", "Alta"],
      default: "Baixa",
      index: true,
    },

    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario", // Referencia o Model 'Usuario'
      required: true,
    },
    anexo: { type: String }, // Campo para armazenar o caminho do anexo
    anexos: [{ type: String }],
    // Array de strings para múltiplos anexos
  },
  // Adiciona createdAt e updatedAt automaticamente
  { timestamps: true }
);
const Tarefa = mongoose.model("Tarefa", tarefaSchema);
export default Tarefa;
