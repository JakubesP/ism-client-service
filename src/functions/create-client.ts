import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  parseJsonToDto,
  createHttpError,
  HttpResult,
  createHttpResponse,
  httpHandler,
} from 'ism-common';
import { CreateClientDto, createClientDtoValidationSchema } from '../dtos';
import Services from '../services';
import { presentClient } from '../models';

const createClientHandler = async (event: APIGatewayProxyEvent): Promise<HttpResult<object>> => {
  const [invalidDataError, createClientDto] = await parseJsonToDto<CreateClientDto>(
    event.body || '',
    createClientDtoValidationSchema
  );

  if (invalidDataError) {
    switch (invalidDataError.exception) {
      case 'INVALID_JSON':
        return createHttpError(400, invalidDataError.source!);
      default:
        return createHttpError(422, invalidDataError.source!);
    }
  }

  const [createClientError, client] = await Services.createClient(createClientDto!, {
    notificationTopic: process.env.ISM_CREATE_CLIENT_TOPIC!,
  });

  if (createClientError) {
    switch (createClientError.exception) {
      case 'CONFLICT':
        return createHttpError(409, 'Conflict creating client');
      default:
        return createHttpError(500, 'Internal server error');
    }
  }

  return createHttpResponse(200, { ...presentClient(client!) });
};

export const handler = httpHandler(createClientHandler);
