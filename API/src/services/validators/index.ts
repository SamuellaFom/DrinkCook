import Joi from "joi";

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface ValidationError {
  [key: string]: string
}

export const generateValidationErrorMessage = (
  errorDetails: Joi.ValidationErrorItem[]
): ValidationError => {
  const formattedErrors: ValidationError = {}
  errorDetails.forEach((detail) => {
    const key = detail.path.join(".")

    formattedErrors[key] = detail.message
  })
  return formattedErrors
}

export const PaginationValidation = Joi.object<PaginationRequest>({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
}).options({ abortEarly: false })