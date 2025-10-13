import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Dog } from 'lucide-react';
import type { BreedTemplate } from '@/types/api';

export const BreedTemplateManager: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<BreedTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<BreedTemplate>>({
    breed_name: '',
    description: '',
    size: '',
    temperament: [],
  });

  const queryClient = useQueryClient();

  const { data: breeds = [] } = useQuery({
    queryKey: ['breed-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breed_templates')
        .select('*')
        .order('breed_name');
      if (error) throw error;
      return data as BreedTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<BreedTemplate>) => {
      const { error } = await supabase
        .from('breed_templates')
        .insert(data as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breed-templates'] });
      toast.success('Breed template created');
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BreedTemplate> }) => {
      const { error } = await supabase
        .from('breed_templates')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breed-templates'] });
      toast.success('Breed template updated');
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('breed_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breed-templates'] });
      toast.success('Breed template deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      breed_name: '',
      description: '',
      size: '',
      temperament: [],
    });
    setEditingBreed(null);
  };

  const handleSubmit = () => {
    if (!formData.breed_name) {
      toast.error('Breed name is required');
      return;
    }

    if (editingBreed) {
      updateMutation.mutate({ id: editingBreed.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (breed: BreedTemplate) => {
    setEditingBreed(breed);
    setFormData(breed);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dog className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Breed Templates</h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Breed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBreed ? 'Edit Breed Template' : 'Create Breed Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Breed Name *</Label>
                <Input
                  value={formData.breed_name}
                  onChange={(e) => setFormData({ ...formData, breed_name: e.target.value })}
                  placeholder="e.g., Cockapoo"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the breed"
                  rows={3}
                />
              </div>

              <div>
                <Label>Size</Label>
                <Input
                  value={formData.size || ''}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g., Small, Medium, Large"
                />
              </div>

              <div>
                <Label>Temperament (comma-separated)</Label>
                <Input
                  value={(formData.temperament || []).join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperament: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g., Friendly, Energetic, Intelligent"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBreed ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {breeds.map((breed) => (
          <Card key={breed.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{breed.breed_name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(breed)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(breed.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {breed.description && (
                <p className="text-sm text-muted-foreground">{breed.description}</p>
              )}
              
              {breed.size && (
                <div>
                  <span className="font-semibold">Size:</span> {breed.size}
                </div>
              )}

              {breed.temperament && breed.temperament.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="font-semibold">Temperament:</span>
                  {breed.temperament.map((trait, idx) => (
                    <Badge key={idx} variant="secondary">
                      {trait}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};