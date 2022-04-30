import { APIGatewayProxyEvent } from 'aws-lambda';
import { createHttpError, HttpResult, createHttpResponse, httpHandler } from 'ism-common';
import Services from '../services';

const deactivateClientHandler = async (
  event: APIGatewayProxyEvent
): Promise<HttpResult<object>> => {
  const clientId = event.pathParameters?.id;
  if (!clientId) return createHttpError(400, 'There is no valid id provided');

  const [deleteClientError] = await Services.deactivateClient(clientId, {
    notificationTopic: process.env.ISM_DEACTIVATE_CLIENT_TOPIC!,
  });

  if (deleteClientError) {
    switch (deleteClientError.exception) {
      case 'CLIENT_IS_UNAVAILABLE':
        return createHttpError(403, 'Client does not exist or is deactivated');
      default:
        return createHttpError(500, 'Internal server error');
    }
  }

  return createHttpResponse(204, { success: true });
};

export const handler = httpHandler(deactivateClientHandler);
