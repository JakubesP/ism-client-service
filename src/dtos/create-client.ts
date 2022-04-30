import Joi from 'joi';

export interface CreateClientDto {
  id: string;
  name: string;
  surname: string;
  email: string;
  personalCode: string;
  dateOfBirth: string;
}

export const createClientDtoValidationSchema = Joi.object<CreateClientDto>({
  id: Joi.string().uuid().required(),
  name: Joi.string().required(),
  surname: Joi.string().required(),
  email: Joi.string().email().required(),
  personalCode: Joi.string().required(),
  dateOfBirth: Joi.string().required(),
});
