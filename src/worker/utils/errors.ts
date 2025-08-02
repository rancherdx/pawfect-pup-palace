import { corsHeaders } from './cors';

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  const status = (error as { status?: number })?.status || 500;
  const message = (error as { message?: string })?.message || 'Internal Server Error';
  
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
}
