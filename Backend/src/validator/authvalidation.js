const Joi=require("joi");

const registerValidation = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.empty": "Password is required",
    }),
});

module.exports={
    registerValidation
}