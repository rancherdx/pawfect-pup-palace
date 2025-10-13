import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';

interface ColorTemplate {
  id: string;
  color_name: string;
  layman_description: string | null;
  created_at: string;
}

export const ColorTemplateManager: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorTemplate | null>(null);
  const [colorName, setColorName] = useState('');
  const [description, setDescription] = useState('');

  const queryClient = useQueryClient();

  const { data: colors = [] } = useQuery({
    queryKey: ['color-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('color_templates')
        .select('*')
        .order('color_name');
      if (error) throw error;
      return data as ColorTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { color_name: string; layman_description: string }) => {
      const { error } = await supabase
        .from('color_templates')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['color-templates'] });
      toast.success('Color template created');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('This color already exists');
      } else {
        toast.error('Failed to create color template');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ColorTemplate> }) => {
      const { error } = await supabase
        .from('color_templates')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['color-templates'] });
      toast.success('Color template updated');
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('color_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['color-templates'] });
      toast.success('Color template deleted');
    },
  });

  const resetForm = () => {
    setColorName('');
    setDescription('');
    setEditingColor(null);
  };

  const handleSubmit = () => {
    if (!colorName.trim()) {
      toast.error('Color name is required');
      return;
    }

    if (editingColor) {
      updateMutation.mutate({
        id: editingColor.id,
        data: { color_name: colorName, layman_description: description },
      });
    } else {
      createMutation.mutate({ color_name: colorName, layman_description: description });
    }
  };

  const handleEdit = (color: ColorTemplate) => {
    setEditingColor(color);
    setColorName(color.color_name);
    setDescription(color.layman_description || '');
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Color Templates</h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Color
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingColor ? 'Edit Color Template' : 'Create Color Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Color Name *</Label>
                <Input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="e.g., Apricot"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A warm peachy-cream color"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingColor ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color) => (
          <Card key={color.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{color.color_name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(color)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(color.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {color.layman_description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{color.layman_description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};