import Services from '../src/services';
import Repository from '../src/repository';
import { Result, createException } from 'ism-common';
import Publisher from '../src/publisher';

describe('deactivateClient', () => {
  const sampleConfig = {
    notificationTopic: 'CreateClient',
  };

  it('Client is unavailable', async () => {
    jest
      .spyOn(Repository, 'deactivateClient')
      .mockResolvedValue(Result.err(createException('CLIENT_IS_UNAVAILABLE')));

    const [err, client] = await Services.deactivateClient(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleConfig
    );

    expect(err!.exception).toBe('CLIENT_IS_UNAVAILABLE');
    expect(client).toBe(undefined);
  });

  it('Database write error', async () => {
    jest
      .spyOn(Repository, 'deactivateClient')
      .mockResolvedValue(Result.err(createException('DB_WRITE_ERR')));

    const [err, client] = await Services.deactivateClient(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleConfig
    );

    expect(err!.exception).toBe('DB_WRITE_ERR');
    expect(client).toBe(undefined);
  });

  it('Publish message error', async () => {
    jest.spyOn(Repository, 'deactivateClient').mockResolvedValue(Result.ok(undefined));
    jest
      .spyOn(Publisher, 'publishSnsMessage')
      .mockResolvedValue(Result.err(createException('SNS_PUBLISH_ERR')));

    const [err, client] = await Services.deactivateClient(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleConfig
    );

    expect(err!.exception).toBe('PUBLISH_MESSAGE_ERR');
    expect(client).toBe(undefined);
  });

  it('Delete client', async () => {
    jest.spyOn(Repository, 'deactivateClient').mockResolvedValue(Result.ok(undefined));
    jest.spyOn(Publisher, 'publishSnsMessage').mockResolvedValue(Result.ok(undefined));

    expect(Repository.deactivateClient).toBeCalledWith('65a209e9-30f4-4a19-8668-958605fa1f1c');
    expect(Publisher.publishSnsMessage).toBeCalledWith(
      {
        clientId: '65a209e9-30f4-4a19-8668-958605fa1f1c',
      },
      'CreateClient'
    );

    const [err, client] = await Services.deactivateClient(
      '65a209e9-30f4-4a19-8668-958605fa1f1c',
      sampleConfig
    );

    expect(err).toBe(undefined);
    expect(client).toEqual(undefined);
  });
});
