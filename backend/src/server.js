import "dotenv/config" 
import express from "express"
import cors from "cors"

//models
import models from "./models/postagemModel.js"

//importação da conexão do database
import conn from "./config/conn.js";

//conexão com o banco 
conn.sync().then(()=>{
    console.log("Olá mundo!");
    app.listen(PORT,()=>{
        console.log("servidor rodando na porta :",PORT)
    })
})
.catch((err)=> console.error(err));