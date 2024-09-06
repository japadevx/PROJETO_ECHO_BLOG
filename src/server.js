import "dotenv/config" 
import express from "express"
import cors from "cors"

//models
import models from "./models/postagemModel.js"
import postRoutes from "./routes/postRouter.js"

//importação da conexão do database
import conn from "./config/conn.js";

const PORT = process.env.PORT || 3000
const app = express();

//middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/postagens", postRoutes);

//conexão com o banco 
conn.sync().then(()=>{
    console.log("Olá mundo!");
    app.listen(PORT,()=>{
        console.log("servidor rodando na porta :",PORT)
    })
})
.catch((err)=> console.error(err));