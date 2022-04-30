import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  HttpResult,
  createHttpResponse,
  httpHandler,
  createHttpError,
  parseJsonToDto,
} from 'ism-common';
import Services from '../services';
import { UpdateClientDto, updateClientDtoValidationSchema, isUpdateClientDtoEmpty } from '../dtos';
import { presentClient } from '../models';

const updateClientHandler = async (event: APIGatewayProxyEvent): Promise<HttpResult<object>> => {
  const clientId = event.pathParameters?.id;
  if (!clientId) return createHttpError(400, 'There is no valid id provided');

  const [invalidDataError, updateClientDto] = await parseJsonToDto<UpdateClientDto>(
    event.body || '',
    updateClientDtoValidationSchema
  );

  if (invalidDataError) {
    switch (invalidDataError.exception) {
      case 'INVALID_JSON':
        return createHttpError(400, invalidDataError.source!);
      default:
        return createHttpError(422, invalidDataError.source!);
    }
  }

  if (isUpdateClientDtoEmpty(updateClientDto!)) {
    return createHttpError(422, 'No fields to update are provided');
  }

  const [updateClientError, client] = await Services.updateClient(clientId, updateClientDto!);

  if (updateClientError) {
    switch (updateClientError?.exception) {
      case 'CLIENT_IS_UNAVAILABLE':
        return createHttpError(404, 'Client does not exist or is deactivated');
      default:
        return createHttpError(500, 'Internal server error');
    }
  }

  return createHttpResponse(200, { ...presentClient(client!) });
};

export const handler = httpHandler(updateClientHandler);
