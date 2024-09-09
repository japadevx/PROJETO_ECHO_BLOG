import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import usuario from '../models/usuarioModel.js'; // Model do usuário
import formatZodError from '../helpers/zodError.js'; // Helper para formatar erros do Zod

// Esquema de validação para registro de usuário
const registerUserSchema = z.object({
    nome: z.string().min(1, 'O nome é obrigatório'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    papel: z.enum(['administrador', 'autor', 'leitor']).optional().default('leitor')
});

// Esquema de validação para login de usuário
const loginUserSchema = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(8, 'Senha incorreta')
});

// RF01 - Registro de Usuário
export const registrarUsuario = async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        const usuarioData = registerUserSchema.parse(req.body);

        const usuarioExistente = await usuario.findOne({ where: { email: usuarioData.email } });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'E-mail já cadastrado' });
        }

        const hashSenha = await bcrypt.hash(usuarioData.senha, 10);

        const novoUsuario = await usuario.create({
            ...usuarioData,
            senha: hashSenha
        });

        return res.status(201).json({
            message: 'Usuário registrado com sucesso',
            usuario: novoUsuario
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    }
};

// RF02 - Autenticação de Usuário (Login)
export const loginUsuario = async (req, res) => {
    try {
        const usuarioData = loginUserSchema.parse(req.body);

        const usuarioExistente = await usuario.findOne({ where: { email: usuarioData.email } });
        if (!usuarioExistente) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(usuarioData.senha, usuarioExistente.senha);
        if (!senhaValida) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: usuarioExistente.id, papel: usuarioExistente.papel },
            process.env.JWT_SECRET, // Definir JWT_SECRET nas variáveis de ambiente
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login bem-sucedido',
            token
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
    }
};

// RF03 - Atualização de Perfil de Usuário
export const atualizarPerfilUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = registerUserSchema.partial().parse(req.body);

        if (dadosAtualizados.senha) {
            dadosAtualizados.senha = await bcrypt.hash(dadosAtualizados.senha, 10);
        }

        const usuarioExistente = await usuario.findByPk(id);
        if (!usuarioExistente) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (dadosAtualizados.email) {
            const emailExiste = await usuario.findOne({ where: { email: dadosAtualizados.email } });
            if (emailExiste && emailExiste.id !== usuarioExistente.id) {
                return res.status(400).json({ message: 'E-mail já está em uso' });
            }
        }

        await usuario.update(dadosAtualizados, { where: { id } });
        return res.status(200).json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
    }
};

// RF04 - Listagem de Usuários (Admin)
export const listarUsuarios = async (req, res) => {
    try {
        const { nome, email, papel } = req.query;

        // Constrói a cláusula where usando operadores SQL padrão
        const whereClause = {};

        if (nome) whereClause.nome = `%${nome}%`; // Filtra pelo nome
        if (email) whereClause.email = `%${email}%`; // Filtra pelo email
        if (papel) whereClause.papel = papel; // Filtra pelo papel

        const usuarios = await usuario.findAll({
            where: whereClause
        });

        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao listar usuários', error: error.message });
    }
};
// RF05 - Exclusão de Usuário (Admin)
export const excluirUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuarioExistente = await usuario.findByPk(id);
        if (!usuarioExistente) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        await usuario.destroy({ where: { id } });
        return res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir usuário', error: error.message });
    }
};

// RF07 - Gerenciamento de Papéis de Usuário (Admin)
export const atualizarPapelUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { papel } = z.object({ papel: z.enum(['administrador', 'autor', 'leitor']) }).parse(req.body);

        const usuarioExistente = await usuario.findByPk(id);
        if (!usuarioExistente) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        await usuario.update({ papel }, { where: { id } });
        return res.status(200).json({ message: 'Papel de usuário atualizado com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: 'Erro ao atualizar papel do usuário', error: error.message });
    }
};
