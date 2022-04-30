import { APIGatewayProxyEvent } from 'aws-lambda';
import { createHttpError, HttpResult, createHttpResponse, httpHandler } from 'ism-common';
import Services from '../services';
import { presentClient } from '../models';

const getClientHandler = async (event: APIGatewayProxyEvent): Promise<HttpResult<object>> => {
  const clientId = event.pathParameters?.id;
  if (!clientId) return createHttpError(400, 'There is no valid id provided');

  const [getClientError, client] = await Services.getClient(clientId);

  if (getClientError) {
    switch (getClientError.exception) {
      case 'CLIENT_NOT_FOUND':
        return createHttpError(404, 'Client not found');
      default:
        return createHttpError(500, 'Internal server error');
    }
  }

  return createHttpResponse(200, { ...presentClient(client!) });
};

export const handler = httpHandler(getClientHandler);
