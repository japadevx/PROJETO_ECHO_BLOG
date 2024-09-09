import conn from "../config/conn.js"
import { DataTypes } from "sequelize"

const postagem = conn.define(
    "postagens",
{
    id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    titulo:{
        type:DataTypes.STRING,
        allowNull: false,
        required:true
    },
    conteudo:{
        type:DataTypes.TEXT,
        allowNull: false,
        required:true
    },
    data_publicacao:{
        type:DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        required:true
    },
    autor:{
        type:DataTypes.STRING,
        allowNull: false,
        required:true
    },
    imagem:{
        type:DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: "postagem"
}
)
export default postagem