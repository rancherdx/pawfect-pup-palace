
import { corsHeaders } from './cors';

export function handleApiError(error: any) {
  console.error('API Error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
