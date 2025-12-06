import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: true,
    select: false,
  },
});

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
