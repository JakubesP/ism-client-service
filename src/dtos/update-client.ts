import Joi from 'joi';

export interface UpdateClientDto {
  name?: string;
  surname?: string;
  email?: string;
}

export const updateClientDtoValidationSchema = Joi.object<UpdateClientDto>({
  name: Joi.string().optional(),
  surname: Joi.string().optional(),
  email: Joi.string().email().optional(),
});

export const isUpdateClientDtoEmpty = (dto: UpdateClientDto) => {
  const { name, surname, email } = dto;
  if (name || surname || email) return false;
  return true;
};
