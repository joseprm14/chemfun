const Joi = require('joi');

const passwordComplexity = Joi.string()
  .min(8)
  .max(72) // por bcrypt
  .pattern(/(?=.*[a-z])/, 'una minúscula')
  .pattern(/(?=.*[A-Z])/, 'una mayúscula')
  .pattern(/(?=.*\d)/, 'un número')
  .pattern(/(?=.*[^A-Za-z0-9])/, 'un carácter especial')
  .messages({
    'string.pattern.name': 'La contraseña debe incluir {#name}.',
    'string.min': 'La contraseña debe tener al menos {#limit} caracteres.',
    'string.max': 'La contraseña no debe superar {#limit} caracteres.'
  });

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: passwordComplexity.required(),
  locale:   Joi.string().valid('es', 'en').default('es'),
  theme:    Joi.string().valid('light', 'dark').default('light')
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const gameSessionSchema = Joi.object({
  mode: Joi.string().valid('click', 'drag').required(), 
  difficulty: Joi.string().valid('fácil', 'medio', 'difícil').required(), 
  score: Joi.number().min(0).required(),
  timeTaken: Joi.number().min(0).required()
});

const preferencesSchema = Joi.object({
  locale: Joi.string().valid('es', 'en'),
  theme:  Joi.string().valid('light', 'dark', 'system')
}).min(1); // al menos un campo

module.exports = {
  registerSchema,
  loginSchema,
  gameSessionSchema,
  preferencesSchema
};
