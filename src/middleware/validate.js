import AppError from "../utils/appError.js";

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      throw new AppError(message, 400, "VALIDATION_ERROR");
    }

    next();
  };
};

export default validate;
