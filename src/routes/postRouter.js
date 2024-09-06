import { Router } from "express";
import { criarPostagem, listarPostagens, buscarPostagemPorId, atualizarPostagem, excluirPostagem, uploadImagemPostagem } from "../controllers/postagemController.js";

const router = Router();

router.post("/", criarPostagem);
router.get("/", listarPostagens);
router.get("/:id", buscarPostagemPorId);
router.put("/:id", atualizarPostagem);
router.delete("/:id", excluirPostagem);
router.post("/", uploadImagemPostagem);

export default router