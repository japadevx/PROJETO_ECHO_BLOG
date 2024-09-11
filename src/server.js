import "dotenv/config" 
import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "node:url"

//models
import "./models/postagemModel.js";
import "./models/usuarioModel.js";

//import rotas
import postRoutes from "./routes/postRouter.js"
import userRoutes from "./routes/userRouter.js"

//importação da conexão do database
import conn from "./config/conn.js";

const PORT = process.env.PORT || 3000

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//middleware para imagem
app.use("/public",express.static(path.join(__dirname,"public")))

//rotas
app.use("/postagens", postRoutes);
app.use("/usuarios", userRoutes);

//conexão com o banco 
conn.sync().then(()=>{
    console.log("Olá mundo!");
    app.listen(PORT,()=>{
        console.log("servidor rodando na porta :",PORT)
    })
})
.catch((err)=> console.error(err));