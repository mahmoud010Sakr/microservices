import { AppError } from "./utilts/errorHandling/AppError.js";
import { globalErrorHandling } from "./utilts/errorHandling/globalErrorHandling.js";
import userRouter from './module/user/user.controller.js'
import wishlistRouter from './module/wishList/wishlist.controller.js'
import DbConnection from "./database/connection.js";
import { rateLimit } from "express-rate-limit";
import compression from "compression";
import {logPerformance} from "./utilts/logPreformance.js";
import helmet from "helmet";
import securityConfig from "./config/security.config.js";



export const bootstrap = (app, express) => {
    DbConnection();

    app.use(helmet(securityConfig.helmetOptions));
    app.use(rateLimit(securityConfig.rateLimit));
    app.use(compression());
    app.use(express.json({ limit: "250mb" }));
    app.use(express.urlencoded({ extended: true, limit: "250mb" }));
    app.use(logPerformance);
    app.use(express.json());
    app.use("/users", userRouter)
    app.use("/wishlist", wishlistRouter)
    app.get('/', (req, res) => {
        res.send('server is running');
    });
    // app.use("*", (req, res, next) => {
    //     throw new AppError("Route not found", 404);
    // });

    app.use(globalErrorHandling);

    app.listen(process.env.PORT, () => {
        console.log(`Example app listening on port ${process.env.PORT}`);
    });
};
