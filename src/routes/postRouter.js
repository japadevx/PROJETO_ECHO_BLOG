import { Router } from "express";
import { criarPostagem, listarPostagens, buscarPostagemPorId, atualizarPostagem, excluirPostagem, uploadImagemPostagem,listarPostagensPorAutor,verificarPermissao,verificarAutenticacao } from "../controllers/postagemController.js";

import imageUpload from "../helpers/image-upload.js";

const router = Router();

router.post("/", imageUpload.single("imagem"),criarPostagem);
router.get("/", listarPostagens);
router.get("/:id", buscarPostagemPorId);
router.put("/:id", atualizarPostagem);
router.delete("/:id", excluirPostagem);
router.post("/", uploadImagemPostagem);
router.post("usuarios/registro", criarPostagem,verificarPermissao,verificarAutenticacao)
router.get("/postagens",listarPostagensPorAutor)
export default router