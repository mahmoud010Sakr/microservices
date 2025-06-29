import { globalErrorHandling } from "./utilts/errorHandling/globalErrorHandling.js";
import DbConnection from "./database/connection.js";
import { rateLimit } from "express-rate-limit";
import compression from "compression";
import { logPerformance } from "./utilts/logPreformance.js";
import helmet from "helmet";
import securityConfig from "./config/security.config.js";
import i18n from "i18n";
import cartRoutes from './module/cart/cart.controller.js'
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n.configure({
    locales: ["en", "ar"],
    directory: path.join(__dirname, "utilts/locales"),
    defaultLocale: "en",
    objectNotation: true,
    autoReload: true,
    updateFiles: false,
    syncFiles: false,
    logWarnFn: function (msg) {
        console.warn("i18n warning:", msg);
    },
    logErrorFn: function (msg) {
        console.error("i18n error:", msg);
    }
});

export const bootstrap = (app, express) => {
    DbConnection();

    app.use(helmet(securityConfig.helmetOptions));
    app.use(rateLimit(securityConfig.rateLimit));
    app.use(compression());
    app.use(i18n.init);

    app.use(express.json({ limit: "250mb" }));
    app.use(express.urlencoded({ extended: true, limit: "250mb" }));
    app.use(logPerformance);
    app.use(express.json());
    app.use('/cart', cartRoutes);
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
