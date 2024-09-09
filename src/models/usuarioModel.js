import conn from "../config/conn.js";
import { DataTypes } from "sequelize";

const Usuario = conn.define(
"usuarios",
{
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
    },
    nome: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true
    },
    email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    required: true,
    validate: {
        isEmail: true
    }
    },
    senha: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
    validate: {
        len: [8, 100] // Força mínima da senha: pelo menos 8 caracteres
    }
    },
    papel: {
    type: DataTypes.ENUM("administrador", "autor", "leitor"),
    defaultValue: "leitor",
    allowNull: true
    }
},
{
    tableName: "usuarios"
}
);

export default Usuario;
