import AWS from 'aws-sdk';
import to from 'await-to-js';
import { createException, Exception, Result } from 'ism-common';
import { logger } from './lib';

const sns = new AWS.SNS();

const publishSnsMessage = async (
  body: object,
  topic: string
): Promise<Result.Variant<void, Exception<'SNS_PUBLISH_ERR'>>> => {
  const [publishMessageErr] = await to(
    sns
      .publish({
        Message: JSON.stringify(body),
        TopicArn: topic,
      })
      .promise()
  );

  if (publishMessageErr) {
    logger.error(`Cannot publish message by SNS. Topic: '${topic}'. Error: ${publishMessageErr}.`);
    return Result.err(createException('SNS_PUBLISH_ERR', publishMessageErr));
  }

  return Result.ok(undefined);
};

export default {
  publishSnsMessage,
};
