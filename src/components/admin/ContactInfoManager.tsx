import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ContactInfo {
  id: string;
  phone: string | null;
  email: string | null;
  address_city: string;
  address_state: string;
  hours_of_operation: Record<string, string>;
  holiday_hours: Record<string, string>;
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export function ContactInfoManager() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', hours: '' });

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
      
      // Transform the data to match our interface
      if (data) {
        setContactInfo({
          id: data.id,
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
      toast.error('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contactInfo) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_contact_info')
        .update({
          phone: contactInfo.phone,
          email: contactInfo.email,
          address_city: contactInfo.address_city,
          address_state: contactInfo.address_state,
          hours_of_operation: contactInfo.hours_of_operation,
          holiday_hours: contactInfo.holiday_hours,
        })
        .eq('id', contactInfo.id);

      if (error) throw error;
      toast.success('Contact information saved successfully');
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  const updateHours = (day: string, hours: string) => {
    if (!contactInfo) return;
    setContactInfo({
      ...contactInfo,
      hours_of_operation: {
        ...contactInfo.hours_of_operation,
        [day]: hours,
      },
    });
  };

  const addHolidayHours = () => {
    if (!contactInfo || !newHoliday.date || !newHoliday.hours) {
      toast.error('Please enter both date and hours');
      return;
    }

    setContactInfo({
      ...contactInfo,
      holiday_hours: {
        ...contactInfo.holiday_hours,
        [newHoliday.date]: newHoliday.hours,
      },
    });
    setNewHoliday({ date: '', hours: '' });
  };

  const removeHolidayHours = (date: string) => {
    if (!contactInfo) return;
    const { [date]: removed, ...rest } = contactInfo.holiday_hours;
    setContactInfo({
      ...contactInfo,
      holiday_hours: rest,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contactInfo) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No contact information found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Manage your business contact details displayed throughout the site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={contactInfo.phone || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="contact@gdspuppies.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City
              </Label>
              <Input
                id="city"
                value={contactInfo.address_city}
                onChange={(e) => setContactInfo({ ...contactInfo, address_city: e.target.value })}
                placeholder="Detroit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={contactInfo.address_state}
                onChange={(e) => setContactInfo({ ...contactInfo, address_state: e.target.value })}
                placeholder="Michigan"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Note: Full address is not displayed publicly. Only city and state are shown.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hours of Operation
          </CardTitle>
          <CardDescription>
            Set your regular business hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <Label className="capitalize">{day}</Label>
              <Input
                value={contactInfo.hours_of_operation[day] || ''}
                onChange={(e) => updateHours(day, e.target.value)}
                placeholder="9:00 AM - 5:00 PM or Closed"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Holiday Hours
          </CardTitle>
          <CardDescription>
            Set special hours for holidays and special occasions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              placeholder="Select date"
              className="flex-1"
            />
            <Input
              value={newHoliday.hours}
              onChange={(e) => setNewHoliday({ ...newHoliday, hours: e.target.value })}
              placeholder="Closed or special hours"
              className="flex-1"
            />
            <Button onClick={addHolidayHours}>Add</Button>
          </div>

          <Separator />

          {Object.keys(contactInfo.holiday_hours).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No holiday hours set
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(contactInfo.holiday_hours).map(([date, hours]) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{hours}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHolidayHours(date)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Contact Information'
        )}
      </Button>
    </div>
  );
}
