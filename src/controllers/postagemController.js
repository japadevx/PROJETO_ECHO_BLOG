import postagem from "../models/postagemModel.js";
import { validationResult } from "express-validator";
import { z } from "zod";
import formatZodError from "../helpers/zodError.js";
import multer from 'multer';
import path from 'path';

// Configuração do Multer para upload de imagem

export const registerUserSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"), // Nome completo obrigatório
    email: z.string().email("E-mail inválido"),    // E-mail deve ser válido
    senha: z.string()
        .min(8, "A senha deve ter no mínimo 8 caracteres")
        .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
        .regex(/[0-9]/, "A senha deve conter pelo menos um número"),  // Senha com força mínima
    imagem: z.string().optional(),                 // Imagem é opcional
    papel: z.enum(['administrador', 'autor', 'leitor']).optional().default('leitor'), // Papel com valor padrão
});
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Somente arquivos JPEG, JPG e PNG são permitidos!'));
    }
}).single('imagem');
// Esquemas de validação com Zod
const idSchema = z.string().uuid('ID inválido');
const createPostSchema = z.object({
    titulo: z.string().min(1, 'O título é obrigatório'),
    conteudo: z.string().min(1, 'O conteúdo é obrigatório'),
    autor: z.string().min(1, 'O autor é obrigatório'),
    imagem: z.string().url('A imagem deve ser uma URL válida').optional()
});
const updatePostSchema = z.object({
    titulo: z.string().min(1, 'O título é obrigatório').optional(),
    conteudo: z.string().min(1, 'O conteúdo é obrigatório').optional(),
    imagem: z.string().url('A imagem deve ser uma URL válida').optional()
});
// RF01 - Criar Postagem
export const criarPostagem = async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        const postagemData = createPostSchema.parse(req.body);

        const novaPostagem = {
            ...postagemData,
            dataPublicacao: new Date()
        };

        const resultado = await postagem.create(novaPostagem);
        return res.status(201).json({
            message: 'Postagem criada com sucesso',
            postagem: resultado
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao criar postagem', error: error.message });
    }
};
// RF02 - Listar Postagens com Paginação
export const listarPostagens = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const totalPostagens = await postagem.count();
        const postagens = await postagem.findAll({ limit, offset });

        const totalPaginas = Math.ceil(totalPostagens / limit);
        const proximaPagina = page < totalPaginas ? `/postagens?page=${page + 1}&limit=${limit}` : null;

        return res.status(200).json({
            totalPostagens,
            totalPaginas,
            paginaAtual: page,
            itemsPorPagina: limit,
            proximaPagina,
            postagens
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao listar postagens', error: error.message });
    }
};
// RF03 - Buscar Postagem por ID
export const buscarPostagemPorId = async (req, res) => {
    try {
        const { id } = idSchema.parse(req.params);

        const resultado = await postagem.findByPk(id);

        if (!resultado) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }

        return res.status(200).json(resultado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao buscar postagem', error: error.message });
    }
};
// RF04 - Atualizar Postagem
export const atualizarPostagem = async (req, res) => {
    try {
        const { id } = idSchema.parse(req.params);
        const dadosAtualizados = updatePostSchema.parse(req.body);

        const postagemExistente = await postagem.findByPk(id);
        if (!postagemExistente) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }

        await postagem.update(dadosAtualizados, { where: { id } });
        return res.status(200).json({ message: 'Postagem atualizada com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao atualizar postagem', error: error.message });
    }
};
// RF05 - Excluir Postagem
export const excluirPostagem = async (req, res) => {
    try {
        const { id } = idSchema.parse(req.params);

        const postagemExistente = await postagem.findByPk(id);
        if (!postagemExistente) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }

        await postagem.destroy({ where: { id } });
        return res.status(200).json({ message: 'Postagem excluída com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao excluir postagem', error: error.message });
    }
};
// RF06 - Upload de Imagem
export const uploadImagemPostagem = (req, res) => {
    try {
        const { id } = idSchema.parse(req.params);

        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError || err) {
                return res.status(400).json({ message: 'Erro no upload da imagem', error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Nenhuma imagem foi enviada' });
            }

            const postagemExistente = await postagem.findByPk(id);
            if (!postagemExistente) {
                return res.status(404).json({ message: 'Postagem não encontrada' });
            }

            const imagemPath = req.file.path;
            await postagem.update({ imagem: imagemPath }, { where: { id } });

            return res.status(200).json({
                message: 'Imagem carregada com sucesso',
                imagemPath
            });
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao fazer upload da imagem', error: error.message });
    }
};
export const listarPostagensPorAutor = async (req, res) => {
    try {
        const { autor } = req.query;

        // Busca as postagens associadas ao autor especificado
        const postagens = await postagem.findAll({ where: { autorId: autor } });

        if (!postagens || postagens.length === 0) {
            return res.status(404).json({ message: 'Nenhuma postagem encontrada para este autor' });
        }

        return res.status(200).json({ postagens });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao listar postagens', error: error.message });
    }
};
export const verificarAutenticacao = (req, res, next) => {
    const usuario = req.usuario; // Supondo que o usuário autenticado está anexado à requisição
    if (!usuario) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    next();
};
// Middleware para verificar se o usuário tem permissão para criar postagens
export const verificarPermissao = (req, res, next) => {
    const { papel } = req.usuario;
    if (papel !== 'autor' && papel !== 'administrador') {
        return res.status(403).json({ message: 'Acesso negado. Apenas autores e administradores podem criar postagens.' });
    }
    next();
}