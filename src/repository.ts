import to from 'await-to-js';
import { logger } from './lib';
import { Result, Exception, createException } from 'ism-common';
import { Client } from './models';
import AWS from 'aws-sdk';
import { UpdateClientDto } from './dtos';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const clientsTableName = process.env.ISM_CLIENTS_TABLE!;

const createClient = async (
  client: Client
): Promise<Result.Variant<Client, Exception<'CONFLICT' | 'DB_WRITE_ERR'>>> => {
  const [putErr, addedClient] = await to<AWS.DynamoDB.DocumentClient.PutItemOutput, AWS.AWSError>(
    dynamodb
      .put({
        TableName: clientsTableName,
        Item: client,
        ConditionExpression: 'attribute_not_exists(Id)',
      })
      .promise()
  );

  if (putErr) {
    const message = `Cannot perform put request. Error: ${putErr}`;

    if (putErr.code === 'ConditionalCheckFailedException') {
      logger.warn(message);
      return Result.err(createException('CONFLICT', putErr));
    } else {
      logger.error(message);
      return Result.err(createException('DB_WRITE_ERR', putErr));
    }
  }

  return Result.ok(addedClient.Attributes as Client);
};

const deactivateClient = async (
  id: string
): Promise<Result.Variant<void, Exception<'CLIENT_IS_UNAVAILABLE' | 'DB_WRITE_ERR'>>> => {
  const [updateErr] = await to<unknown, AWS.AWSError>(
    dynamodb
      .update({
        TableName: clientsTableName,
        Key: { Id: id },
        UpdateExpression: 'set Deactivated = :trueVal',
        ConditionExpression: 'attribute_exists(Id) AND Deactivated = :falseVal',
        ExpressionAttributeValues: {
          ':trueVal': true,
          ':falseVal': false,
        },
      })
      .promise()
  );

  if (updateErr) {
    const message = `Cannot perform update request. Error: ${updateErr}`;

    if (updateErr.code === 'ConditionalCheckFailedException') {
      logger.warn(message);
      return Result.err(createException('CLIENT_IS_UNAVAILABLE', updateErr));
    } else {
      logger.error(message);
      return Result.err(createException('DB_WRITE_ERR', updateErr));
    }
  }

  return Result.ok(undefined);
};

const getClient = async (
  id: string
): Promise<Result.Variant<Client, Exception<'CLIENT_NOT_FOUND' | 'DB_READ_ERR'>>> => {
  const [getItemErr, result] = await to(
    dynamodb
      .get({
        TableName: clientsTableName,
        Key: { Id: id },
      })
      .promise()
  );

  if (getItemErr) {
    logger.error(`Cannot get client. Client id: '${id}'. Error: ${getItemErr}`);
    return Result.err(createException('DB_READ_ERR', getItemErr));
  }

  const client = result.Item as Client | undefined;

  if (!client) {
    logger.warn(`Client '${id}' not found`);
    return Result.err(createException('CLIENT_NOT_FOUND'));
  }

  return Result.ok(client);
};

export const generateUpdateAttributes = (fields: UpdateClientDto) => {
  let expression = 'SET ';
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};

  for (let [key, val] of Object.entries(fields)) {
    if (key) {
      expression = expression.concat(`#${key} = :${key}_val, `);
      expressionAttributeValues[`:${key}_val`] = val;
      expressionAttributeNames[`#${key}`] = key.charAt(0).toUpperCase() + key.slice(1);
    }
  }

  if (Object.keys(expressionAttributeValues).length === 0) {
    return undefined;
  }

  expression = expression.slice(0, -2);

  return {
    expression,
    expressionAttributeValues,
    expressionAttributeNames,
  };
};

const updateClient = async (
  id: string,
  fields: UpdateClientDto
): Promise<
  Result.Variant<
    Client,
    Exception<'CLIENT_IS_UNAVAILABLE' | 'DB_WRITE_ERR' | 'NO_FIELDS_TO_UPDATE'>
  >
> => {
  const attrs = generateUpdateAttributes(fields);

  if (!attrs) return Result.err(createException('NO_FIELDS_TO_UPDATE'));

  const { expression, expressionAttributeValues, expressionAttributeNames } = attrs!;

  const params = {
    TableName: clientsTableName,
    Key: { Id: id },
    UpdateExpression: expression,
    ExpressionAttributeValues: { ...expressionAttributeValues, ':falseVal': false },
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW',
    ConditionExpression: 'attribute_exists(Id) AND Deactivated = :falseVal',
  };

  const [updateErr, result] = await to<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>(
    dynamodb.update(params).promise()
  );

  if (updateErr) {
    const message = `Cannot update client. Client id: '${id}'. Fields to update: '${fields}'. Error: ${updateErr}`;

    if (updateErr.code === 'ConditionalCheckFailedException') {
      logger.warn(message);
      return Result.err(createException('CLIENT_IS_UNAVAILABLE', updateErr));
    } else {
      logger.error(message);
      return Result.err(createException('DB_WRITE_ERR', updateErr));
    }
  }

  const updatedRecord = result.Attributes;

  if (!updatedRecord) {
    logger.error(`No record was updated. Client id: '${id}'. Fields to update: '${fields}'`);
    return Result.err(createException('DB_WRITE_ERR'));
  }

  return Result.ok(updatedRecord as Client);
};

export default {
  createClient,
  deactivateClient,
  getClient,
  updateClient,
};
