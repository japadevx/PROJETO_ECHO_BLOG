import {check} from "express-validator";

export const validateId = [
    check("id").isUUID().withMessage("formato do id invalido")
];