import type {Response, Request} from 'express'
import express from 'express'
import dotenv from 'dotenv'
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
dotenv.config()
import cors from 'cors'

import priceRoutes from './routes/price.route.js'
import marketRoutes from './routes/market.route.js'
import analysisRoutes from './routes/analisys.route.js'
import esgRoutes from './routes/esg.route.js'
import optionsRoutes from './routes/options.route.js'
import historicRoutes from './routes/historic.route.js'
import newsRoutes from './routes/news.route.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/init', (req: Request, resp: Response)=>{
    resp.json("APP DE TRANDING INICIADO")
})

app.use('/price', priceRoutes)
app.use("/market", marketRoutes)
app.use("/analysis", analysisRoutes)
app.use("/esg", esgRoutes)
app.use("/options", optionsRoutes)
app.use("/historic", historicRoutes)
app.use("/news", newsRoutes)


export default app