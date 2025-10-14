import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContactInfo {
  phone: string | null;
  email: string | null;
  address_city: string;
  address_state: string;
  hours_of_operation: Record<string, string>;
  holiday_hours: Record<string, string>;
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_contact_info')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setContactInfo({
          phone: data.phone,
          email: data.email,
          address_city: data.address_city,
          address_state: data.address_state,
          hours_of_operation: data.hours_of_operation as Record<string, string>,
          holiday_hours: data.holiday_hours as Record<string, string>,
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  return { contactInfo, loading };
};
