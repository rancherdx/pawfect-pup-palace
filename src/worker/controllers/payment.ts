
import type { Env } from '../env';
import { processPayment as processSquarePayment, handleSquareWebhook as handleSquareWebhookEvent } from './squarePayment';

/**
 * Processes a payment request using Square
 */
export async function processPayment(request: Request, env: Env): Promise<Response> {
  return processSquarePayment(request, env);
}

/**
 * Handles incoming Square webhooks
 */
export async function handleSquareWebhook(request: Request, env: Env): Promise<Response> {
  return handleSquareWebhookEvent(request, env);
}
