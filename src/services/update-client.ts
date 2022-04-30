import { UpdateClientDto } from '../dtos';
import { createException, Exception, Result } from 'ism-common';
import Repository from '../repository';
import { Client } from '../models';

export const updateClient = async (
  clientId: string,
  fields: UpdateClientDto
): Promise<Result.Variant<Client, Exception<'CLIENT_IS_UNAVAILABLE' | 'DB_WRITE_ERR'>>> => {
  const [updateErr, updatedClient] = await Repository.updateClient(clientId, fields);

  if (updateErr)
    switch (updateErr.exception) {
      case 'CLIENT_IS_UNAVAILABLE':
        return Result.err(createException('CLIENT_IS_UNAVAILABLE', updateErr.source));
      default:
        return Result.err(createException('DB_WRITE_ERR', updateErr.source));
    }

  return Result.ok(updatedClient);
};
