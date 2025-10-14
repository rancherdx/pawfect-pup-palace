import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Generate a device fingerprint for anonymous users
 */
function generateDeviceFingerprint(): string {
  const stored = localStorage.getItem('chat_session_id');
  if (stored) return stored;
  
  const fingerprint = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('chat_session_id', fingerprint);
  return fingerprint;
}

/**
 * Hook to manage chat session for both anonymous and authenticated users
 */
export function useChatSession() {
  const { user } = useAuth();
  const [sessionId] = useState(() => generateDeviceFingerprint());
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeConversation();
  }, [user, sessionId]);

  const initializeConversation = async () => {
    try {
      setLoading(true);

      // Check for existing conversation
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data: existing } = await query;

      if (existing && existing.length > 0) {
        setConversationId(existing[0].id);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user?.id || null,
            session_id: user ? null : sessionId,
            visitor_name: user?.email?.split('@')[0] || 'Guest',
            visitor_email: user?.email || null,
            current_page: window.location.pathname,
          })
          .select()
          .single();

        if (error) throw error;
        setConversationId(newConv.id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const mergeAnonymousHistory = async () => {
    if (!user || !sessionId) return;

    try {
      // Merge anonymous conversations with user account
      await supabase
        .from('conversations')
        .update({ user_id: user.id, session_id: null })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error merging chat history:', error);
    }
  };

  return {
    conversationId,
    sessionId: user ? null : sessionId,
    userId: user?.id || null,
    loading,
    mergeAnonymousHistory,
  };
}
