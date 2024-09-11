import multer from "multer"
import path from "path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const imageStorage = multer.diskStorage({
    destination: (request, file, cb)=>{
        let folder = ""

        if(request.baseUrl.includes("usuarios")){
            folder = "usuarios"
        }else if(request.baseUrl.includes("postagens")){
            folder = "postagens"    
        }
        cb(null,path.join(__dirname, `../public/${folder}`))
    },
    filename: (request, file, cb) => {
        cb(null,Date.now()+String(Math.floor(Math.random()*10000))+ path.textname(file.originalname))
    }
})
const imageUpload = multer({storage:imageStorage,
    fileFilter(request,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Apenas imagens em formato jpg, jpeg ou png são permitidas"), false)
        }
        cb(null,true)
    }
})

export default imageUpload;