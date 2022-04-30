import Services from '../src/services';
import Repository from '../src/repository';
import { Result, createException } from 'ism-common';
import { Client } from '../src/models';

describe('getClient', () => {
  const sampleClient: Client = {
    Id: '65a209e9-30f4-4a19-8668-958605fa1f1c',
    DateOfBirth: '22.04.2001',
    Email: 'email@domain.com',
    Name: 'Jan',
    Surname: 'Kowalski',
    PersonalCode: '57072972173',
    Deactivated: false,
  };

  it('Client not found', async () => {
    jest
      .spyOn(Repository, 'getClient')
      .mockResolvedValue(Result.err(createException('CLIENT_NOT_FOUND')));

    const [err, client] = await Services.getClient('65a209e9-30f4-4a19-8668-958605fa1f1c');

    expect(err!.exception).toBe('CLIENT_NOT_FOUND');
    expect(client).toBe(undefined);
  });

  it('Database read error', async () => {
    jest
      .spyOn(Repository, 'getClient')
      .mockResolvedValue(Result.err(createException('DB_READ_ERR')));

    const [err, client] = await Services.getClient('65a209e9-30f4-4a19-8668-958605fa1f1c');

    expect(err!.exception).toBe('DB_READ_ERR');
    expect(client).toBe(undefined);
  });

  it('Get client', async () => {
    jest.spyOn(Repository, 'getClient').mockResolvedValue(Result.ok(sampleClient));

    const [err, client] = await Services.getClient('65a209e9-30f4-4a19-8668-958605fa1f1c');

    expect(err).toBe(undefined);
    expect(client).toEqual(sampleClient);
  });
});
