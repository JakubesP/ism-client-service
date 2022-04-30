import { createException, Exception, Result } from 'ism-common';
import Repository from '../repository';
import Publisher from '../publisher';

export const deactivateClient = async (
  clientId: string,
  config: { notificationTopic: string }
): Promise<
  Result.Variant<void, Exception<'CLIENT_IS_UNAVAILABLE' | 'DB_WRITE_ERR' | 'PUBLISH_MESSAGE_ERR'>>
> => {
  const [clientUpdateErr] = await Repository.deactivateClient(clientId);

  if (clientUpdateErr) return Result.err(clientUpdateErr);

  const [publishMessageErr] = await Publisher.publishSnsMessage(
    {
      clientId: clientId,
    },
    config.notificationTopic
  );

  if (publishMessageErr)
    return Result.err(createException('PUBLISH_MESSAGE_ERR', publishMessageErr.source));

  return Result.ok(undefined);
};
