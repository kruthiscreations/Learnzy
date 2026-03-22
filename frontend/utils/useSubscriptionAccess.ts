import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import api from '../utils/api';

interface SubscriptionAccess {
  has_access: boolean;
  reason: string;
  message: string;
  plan?: string;
  days_remaining?: number;
}

export function useSubscriptionAccess() {
  const { user } = useAppStore();
  const [access, setAccess] = useState<SubscriptionAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    if (!user?.user_id) {
      setAccess({ has_access: false, reason: 'no_user', message: 'Please login first' });
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/subscription/check-access/${user.user_id}`);
      setAccess(response.data);
    } catch (error) {
      console.error('Error checking subscription access:', error);
      setAccess({ has_access: false, reason: 'error', message: 'Unable to verify subscription' });
    } finally {
      setLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { access, loading, refetch: checkAccess };
}

export default useSubscriptionAccess;
