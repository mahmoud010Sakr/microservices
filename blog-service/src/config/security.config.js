 const securityConfig = {
    corsOptions: {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    },
    helmetOptions: {
        contentSecurityPolicy: false,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, 
        max: 100, 
    },
    

}
export default securityConfig