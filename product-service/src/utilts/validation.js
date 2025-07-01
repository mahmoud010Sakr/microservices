import joi from 'joi';







export const commonSchema = {
    name: joi.string(),
    email: joi.string(),
    password: joi.string(),
    confirmPassword: joi.string(),
    phone: joi.string(),
    ddress: joi.string(),
    role: joi.string(),
    gender: joi.string(),
    age: joi.number(),
    location: joi.string()
}

export const validation = (schema) => {
    return (req, res, next) => {
        console.log(req.body);
        
        if (req.body.name) {
            try {
                if (typeof req.body.name === 'string') {
                    const trimmedName = req.body.name.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
                    if (trimmedName.startsWith('{') && trimmedName.endsWith('}')) {
                        req.body.name = JSON.parse(trimmedName);
                    }
                }
                if (typeof req.body.name === 'object' && req.body.name !== null) {
                    if (!req.body.name.en || !req.body.name.ar) {
                        req.body.name = JSON.stringify(req.body.name);
                    }
                }
            } catch (error) {
                console.error('Error processing name:', error);
            }
        }
        const validations = {
            params: schema.params?.validate(req.params, { abortEarly: false }),
            query: schema.query?.validate(req.query, { abortEarly: false }),
            body: schema.body?.validate(req.body, { abortEarly: false }),
        };

        const errors = Object.values(validations)
            .filter(v => v?.error)
            .flatMap(v => v.error.details);

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                details: errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        next();
    };
};
