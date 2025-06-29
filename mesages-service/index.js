import express from "express"
import dotenv from "dotenv"
import {bootstrap} from "./src/app.controller.js"
dotenv.config()

const app = express()
bootstrap(app , express);

export default app


