import { APIGatewayProxyResult } from 'aws-lambda';

export function jsonResponse(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {}
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return jsonResponse(statusCode, { error: message });
}
