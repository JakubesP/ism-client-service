import { Client } from '../models';
import { CreateClientDto } from '../dtos';
import { createException, Exception, Result } from 'ism-common';
import Repository from '../repository';
import Publisher from '../publisher';

export const createClient = async (
  createClientDto: CreateClientDto,
  config: { notificationTopic: string }
): Promise<
  Result.Variant<Client, Exception<'CONFLICT' | 'DB_WRITE_ERR' | 'PUBLISH_MESSAGE_ERR'>>
> => {
  const client: Client = {
    Id: createClientDto.id,
    DateOfBirth: createClientDto.dateOfBirth,
    Email: createClientDto.email,
    Name: createClientDto.name,
    Surname: createClientDto.surname,
    PersonalCode: createClientDto.personalCode,
    Deactivated: false,
  };

  const [clientCreationErr] = await Repository.createClient(client);

  if (clientCreationErr) return Result.err(clientCreationErr);

  const [publishMessageErr] = await Publisher.publishSnsMessage(
    {
      clientId: client.Id,
      contribution: 0,
      compensation: 0,
    },
    config.notificationTopic
  );

  if (publishMessageErr)
    return Result.err(createException('PUBLISH_MESSAGE_ERR', publishMessageErr.source));

  return Result.ok(client);
};
