import Services from '../src/services';
import Repository from '../src/repository';
import { Result, createException } from 'ism-common';
import { CreateClientDto } from '../src/dtos';
import { Client } from '../src/models';
import Publisher from '../src/publisher';

describe('createClient', () => {
  const sampleDto: CreateClientDto = {
    id: '65a209e9-30f4-4a19-8668-958605fa1f1c',
    dateOfBirth: '22.04.2001',
    email: 'email@domain.com',
    name: 'Jan',
    surname: 'Kowalski',
    personalCode: '57072972173',
  };

  const sampleClient: Client = {
    Id: '65a209e9-30f4-4a19-8668-958605fa1f1c',
    DateOfBirth: '22.04.2001',
    Email: 'email@domain.com',
    Name: 'Jan',
    Surname: 'Kowalski',
    PersonalCode: '57072972173',
    Deactivated: false,
  };

  const sampleConfig = {
    notificationTopic: 'CreateClient',
  };

  it('Database write conflict', async () => {
    jest
      .spyOn(Repository, 'createClient')
      .mockResolvedValue(Result.err(createException('CONFLICT')));

    const [err, client] = await Services.createClient(sampleDto, sampleConfig);

    expect(err!.exception).toBe('CONFLICT');
    expect(client).toBe(undefined);
  });

  it('Database write error', async () => {
    jest
      .spyOn(Repository, 'createClient')
      .mockResolvedValue(Result.err(createException('DB_WRITE_ERR')));

    const [err, client] = await Services.createClient(sampleDto, sampleConfig);

    expect(err!.exception).toBe('DB_WRITE_ERR');
    expect(client).toBe(undefined);
  });

  it('Publish message error', async () => {
    jest.spyOn(Repository, 'createClient').mockResolvedValue(Result.ok(sampleClient));
    jest
      .spyOn(Publisher, 'publishSnsMessage')
      .mockResolvedValue(Result.err(createException('SNS_PUBLISH_ERR')));

    const [err, client] = await Services.createClient(sampleDto, sampleConfig);

    expect(err!.exception).toBe('PUBLISH_MESSAGE_ERR');
    expect(client).toBe(undefined);
  });

  it('Create client', async () => {
    jest.spyOn(Repository, 'createClient').mockResolvedValue(Result.ok(sampleClient));
    jest.spyOn(Publisher, 'publishSnsMessage').mockResolvedValue(Result.ok(undefined));

    expect(Repository.createClient).toBeCalledWith(sampleClient);
    expect(Publisher.publishSnsMessage).toBeCalledWith(
      {
        clientId: '65a209e9-30f4-4a19-8668-958605fa1f1c',
        contribution: 0,
        compensation: 0,
      },
      'CreateClient'
    );

    const [err, client] = await Services.createClient(sampleDto, sampleConfig);

    expect(err).toBe(undefined);
    expect(client).toEqual(sampleClient);
  });
});
