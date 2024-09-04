import postagem from "../models/postagemModel";
import {validationResult} from "from-validator"
import {z} from "zod";

import formatZodError from "helpers/zodError"


//validação com zod
const createSchema = z.object({
    titulo:z.string().min(3,{msg:"o titulo deve ter pelo menos 5 caracteres"}).transform((txt)=>txt.toLocaleLowerCase()),
    conteudo:z.string().min(10,{msg:"o conteudo deve ter pelo menos 10 caracteres"}),
    autor:z.string().min(10,{msg:"o autor deve ter pelo menos 10 caracteres"}),
    data_publicacao:z.string().min(8,{msg:"a de data_publicacao deve ter pelo menos 8 caracteres"})
})
const getSchemaID = z.object({
    id:z.string().uuid(),
})
const updateSchema = z.object({
    titulo:z.string().min(3,{msg:"o titulo deve ter pelo menos 5 caracteres"}).transform((txt)=>txt.toLocaleLowerCase()),
    conteudo:z.string().min(10,{msg:"o conteudo deve ter pelo menos 10 caracteres"}),
    autor:z.string().min(10,{msg:"o autor deve ter pelo menos 10 caracteres"}),
    data_publicacao:z.string().min(8,{msg:"a de data_publicacao deve ter pelo menos 8 caracteres"})
})
const paramsSchema = z.object({
    id:z.string().uuid(),
})

//listar postagens
export const getPostagens = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const posts = await postagem.findAndCountAll({
            limit,
            offset,
        });
        const totalPages = math.ceil(posts.count / limit);
        res.status(200).json({
            totalposts: posts.count,
            totalPages,
            pageActual:page,
            itemsForPage:limit,
            nextPage:
            totalPages === 0
            ? null
            : `http://localhost:3333/postagens?page=${page + 1}`,
            posts:postagem.rows,
        })
    }catch(error){
        res.status(500).json({msg:"erro na listagem de posts"});
    }
}
//postar postagens 
export const postPostagens = async (req, res)=>{

    const bodyValidation = createSchema.safeParse(req.body);
    if(!bodyValidation.success){
        return res.status(400).json({msg:"os dados recebidos da requisição são invalidos",
        detalhes:formatZodError(bodyValidation.error)
    });
    }
    const {titulo,conteudo,data_publicacao,autor,imagem} = req.body

    if(!titulo){
        return res.status(400).json({msg:"o título é obrigatório"});
    }
    if(!conteudo){
        return res.status(400).json({msg:"o conteúdo é obrigatório"});
    }
    if(!data_publicacao){
        return res.status(400).json({msg:"a data de publicação é obrigatória"});
    }
    if(!autor){
        return res.status(400).json({msg:"o autor é obrigatório"});
    }
    if(!imagem){
        return res.status(400).json({msg:"a imagem é obrigatória"});
    }

    const newPost = {titulo,conteudo,data_publicacao,autor,imagem}
}