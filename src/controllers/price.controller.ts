import type { NextFunction, Response, Request } from "express";
import { getPrice } from "../services/yahoo.service.js";


export const fetchPrice = async(req: Request, resp:Response, next: NextFunction)=>{
    try {
        const result = await getPrice(req.params.symbol)

        resp.status(200).json({data: result})
    } catch (error) {
        next(error)
    }
}