import {Sequelize} from "sequelize";

const conn = new Sequelize("echoblog","root","Sen@iDev77!.",{
    host: "localhost",
    dialect: "mysql"
});

try{
    await conn.authenticate();
    console.log("conectado ao database")
}catch(err){
    console.error("Erro ao conectar ao database",err);
}
export default conn;