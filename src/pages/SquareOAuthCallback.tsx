import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/api/client';

const SquareOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        if (error) {
          setStatus('error');
          setMessage(searchParams.get('error_description') || error);
          // Notify parent window of error
          window.opener?.postMessage({
            type: 'SQUARE_OAUTH_ERROR',
            error: searchParams.get('error_description') || error
          }, window.location.origin);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          window.opener?.postMessage({
            type: 'SQUARE_OAUTH_ERROR',
            error: 'No authorization code received'
          }, window.location.origin);
          return;
        }

        // Call our backend to exchange the code for tokens
        const response = await apiRequest<{success: boolean, merchantId: string, message: string}>(
          `/square/oauth/callback?code=${code}&state=${state || ''}`
        );

        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Square account successfully connected!');
          
          // Notify parent window of success
          window.opener?.postMessage({
            type: 'SQUARE_OAUTH_SUCCESS',
            merchantId: response.merchantId
          }, window.location.origin);
        } else {
          throw new Error('OAuth callback failed');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to connect Square account');
        
        window.opener?.postMessage({
          type: 'SQUARE_OAUTH_ERROR',
          error: error instanceof Error ? error.message : 'Failed to connect Square account'
        }, window.location.origin);
      }
    };

    processCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-brand-red mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connecting to Square</h2>
              <p className="text-gray-600">Processing your authorization...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-700 mb-2">Successfully Connected!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">You can close this window.</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">Connection Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">You can close this window and try again.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareOAuthCallback;