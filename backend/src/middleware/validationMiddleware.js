const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    // Valida la entrada de una petición HTTP en base a un esquema
    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(err => err.message);
        return res.status(400).json({ errors });
    }

    next();
};

module.exports = validate;