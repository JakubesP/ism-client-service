import Services from '../src/services';
import Repository from '../src/repository';
import { Result, createException } from 'ism-common';
import { Client } from '../src/models';
import { UpdateClientDto } from '../src/dtos';

describe('updateClient', () => {
  const sampleClient: Client = {
    Id: '65a209e9-30f4-4a19-8668-958605fa1f1c',
    DateOfBirth: '22.04.2001',
    Email: 'email@domain.com',
    Name: 'Jan',
    Surname: 'Kowalski',
    PersonalCode: '57072972173',
    Deactivated: false,
  };

  const sampleFieldsToUpdate: UpdateClientDto = {
    name: 'Jan',
    surname: 'Kowalski',
  };

  it('Client is unavailable', async () => {
    jest
      .spyOn(Repository, 'updateClient')
      .mockResolvedValue(Result.err(createException('CLIENT_IS_UNAVAILABLE')));

    const [err, client] = await Services.updateClient(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleFieldsToUpdate
    );

    expect(err!.exception).toBe('CLIENT_IS_UNAVAILABLE');
    expect(client).toBe(undefined);
  });

  it('Database write error', async () => {
    jest
      .spyOn(Repository, 'updateClient')
      .mockResolvedValue(Result.err(createException('DB_WRITE_ERR')));

    const [err, client] = await Services.updateClient(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleFieldsToUpdate
    );

    expect(err!.exception).toBe('DB_WRITE_ERR');
    expect(client).toBe(undefined);
  });

  it('Update client', async () => {
    jest.spyOn(Repository, 'updateClient').mockResolvedValue(Result.ok(sampleClient));

    expect(Repository.updateClient).toBeCalledWith(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleFieldsToUpdate
    );

    const [err, client] = await Services.updateClient(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleFieldsToUpdate
    );

    expect(err).toBe(undefined);
    expect(client).toEqual(sampleClient);
  });
});
