import {Router} from "express"
import { registrarUsuario, loginUsuario, atualizarPerfilUsuario, listarUsuarios, excluirUsuario,atualizarPapelUsuario } from "../controllers/usuarioController.js"

const router = Router()

router.post("/registro",registrarUsuario);
router.post("/login/:id",loginUsuario)
router.put("/:id",atualizarPerfilUsuario)
router.get("/",listarUsuarios)
router.delete("/:id",excluirUsuario)
router.put("/:id",atualizarPapelUsuario)

export default router;