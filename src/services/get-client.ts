import { createException, Exception, Result } from 'ism-common';
import Repository from '../repository';
import { Client } from '../models';

export const getClient = async (
  clientId: string
): Promise<Result.Variant<Client, Exception<'CLIENT_NOT_FOUND' | 'DB_READ_ERR'>>> => {
  const [getClientErr, client] = await Repository.getClient(clientId);

  if (getClientErr) return Result.err(getClientErr);

  return Result.ok(client);
};
