import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { adminApi } from '@/api';
import { Puppy, Litter } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ListTree, Dog, ChevronsRight, Trash2, Edit } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import EntityDetailView from './EntityDetailView';
import BulkUpdateStatusDialog from './BulkUpdateStatusDialog';
import { PuppyStatus } from '@/types';

// Define a type for the hierarchical data structure
interface LitterWithPuppies extends Litter {
  puppies: Puppy[];
}

const UnifiedManagementHub = () => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'puppy' | 'litter', id: string } | null>(null);
  const [selectedPuppyIds, setSelectedPuppyIds] = useState<Set<string>>(new Set());
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: puppiesData, isLoading: puppiesLoading, isError: puppiesIsError } = useQuery({
    queryKey: ['puppies'],
    queryFn: () => adminApi.getAllPuppies(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: littersData, isLoading: littersLoading, isError: littersIsError } = useQuery({
    queryKey: ['litters'],
    queryFn: () => adminApi.getAllLitters(),
    staleTime: 5 * 60 * 1000,
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[], status: PuppyStatus }) =>
      adminApi.bulkUpdatePuppiesStatus(ids, status),
    onSuccess: (data) => {
      toast.success(`${data.updatedCount} puppies have been updated.`);
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      setSelectedPuppyIds(new Set());
      setIsUpdateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update puppies: ${error.message}`);
    },
  });

  const { hierarchicalData, unassignedPuppies } = useMemo(() => {
    if (!puppiesData?.puppies || !littersData?.litters) {
      return { hierarchicalData: [], unassignedPuppies: [] };
    }

    const puppies = puppiesData.puppies;
    const litters = littersData.litters;

    const littersWithPuppies: LitterWithPuppies[] = litters.map(litter => ({
      ...litter,
      puppies: puppies.filter(puppy => puppy.litter_id === litter.id),
    }));

    const assignedPuppyIds = new Set(puppies.filter(p => p.litter_id).map(p => p.id));
    const unassigned = puppies.filter(p => !assignedPuppyIds.has(p.id));

    return { hierarchicalData: littersWithPuppies, unassignedPuppies: unassigned };
  }, [puppiesData, littersData]);

  const isLoading = puppiesLoading || littersLoading;
  const isError = puppiesIsError || littersIsError;

  useEffect(() => {
    const channel = supabase.channel('public-tables');
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'puppies' },
        (payload) => {
          console.log('Puppy change received!', payload);
          queryClient.invalidateQueries({ queryKey: ['puppies'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'litters' },
        (payload) => {
          console.log('Litter change received!', payload);
          queryClient.invalidateQueries({ queryKey: ['litters'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  const handlePuppySelection = (puppyId: string, isSelected: boolean) => {
    setSelectedPuppyIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(puppyId);
      } else {
        newSet.delete(puppyId);
      }
      return newSet;
    });
  };

  const handleLitterSelection = (litter: LitterWithPuppies, isSelected: boolean) => {
    setSelectedPuppyIds(prev => {
      const newSet = new Set(prev);
      const puppyIdsInLitter = litter.puppies.map(p => p.id);
      if (isSelected) {
        puppyIdsInLitter.forEach(id => newSet.add(id));
      } else {
        puppyIdsInLitter.forEach(id => newSet.delete(id));
      }
      return newSet;
    });
  };

  const renderBulkActions = () => {
    if (selectedPuppyIds.size === 0) return null;

    return (
      <Card className="m-2">
        <CardHeader className="p-4">
          <CardTitle className="text-base">{selectedPuppyIds.size} puppies selected</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 grid gap-2">
           <Button variant="outline" size="sm" onClick={() => setIsUpdateDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Update Status
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderSidebarContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-full mt-4" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load data. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="p-2 space-y-2">
        <h3 className="font-semibold text-lg px-2 flex items-center"><ListTree className="w-5 h-5 mr-2" /> Litters</h3>
        {hierarchicalData.map(litter => {
            const puppyIdsInLitter = new Set(litter.puppies.map(p => p.id));
            const selectedInLitterCount = Array.from(selectedPuppyIds).filter(id => puppyIdsInLitter.has(id)).length;
            const isAllSelected = litter.puppies.length > 0 && selectedInLitterCount === litter.puppies.length;
            const isPartiallySelected = selectedInLitterCount > 0 && !isAllSelected;

            return (
              <Collapsible key={litter.id} defaultOpen>
                <div className="flex items-center w-full pr-2">
                    <Checkbox
                        className="ml-2"
                        checked={isAllSelected || isPartiallySelected}
                        indeterminate={isPartiallySelected}
                        onCheckedChange={(checked) => handleLitterSelection(litter, !!checked)}
                        disabled={litter.puppies.length === 0}
                    />
                    <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between pl-2">
                        {litter.name}
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pl-6">
                  {litter.puppies.map(puppy => (
                     <div key={puppy.id} className="flex items-center">
                        <Checkbox
                            className="mr-2"
                            checked={selectedPuppyIds.has(puppy.id)}
                            onCheckedChange={(checked) => handlePuppySelection(puppy.id, !!checked)}
                        />
                        <Button
                            variant={selectedEntity?.id === puppy.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setSelectedEntity({ type: 'puppy', id: puppy.id })}
                        >
                        <Dog className="w-4 h-4 mr-2" />
                        {puppy.name}
                        </Button>
                     </div>
                  ))}
                  {litter.puppies.length === 0 && (
                    <p className="text-xs text-muted-foreground p-2 pl-8">No puppies in this litter.</p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )
        })}
         <h3 className="font-semibold text-lg px-2 pt-4 flex items-center"><Dog className="w-5 h-5 mr-2" /> Unassigned Puppies</h3>
         {unassignedPuppies.map(puppy => (
            <div key={puppy.id} className="flex items-center">
                <Checkbox
                    className="ml-2 mr-2"
                    checked={selectedPuppyIds.has(puppy.id)}
                    onCheckedChange={(checked) => handlePuppySelection(puppy.id, !!checked)}
                />
                <Button
                    variant={selectedEntity?.id === puppy.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedEntity({ type: 'puppy', id: puppy.id })}
                >
                <Dog className="w-4 h-4 mr-2" />
                {puppy.name}
                </Button>
            </div>
         ))}
      </div>
    );
  };

  return (
    <>
      <div className="h-full w-full">
        <Card className="h-full w-full border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Unified Management Hub</CardTitle>
            <p className="text-muted-foreground">
              Manage all puppies, litters, and parents from a single, consolidated view.
            </p>
          </CardHeader>
          <CardContent className="h-[calc(100vh-150px)] p-0">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
              <ResizablePanel defaultSize={25} minSize={20}>
                <div className="h-full flex flex-col">
                  {renderBulkActions()}
                  <div className="flex-grow overflow-y-auto">
                    {renderSidebarContent()}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <div className="h-full overflow-y-auto p-4">
                  {selectedEntity ? (
                    <EntityDetailView
                      entityId={selectedEntity.id}
                      entityType={selectedEntity.type}
                      puppies={puppiesData?.puppies || []}
                      litters={littersData?.litters || []}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <ListTree className="w-16 h-16 mb-4" />
                      <h3 className="text-xl font-semibold">Select an Entity</h3>
                      <p>Click on a puppy or litter in the sidebar to view and edit its details.</p>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </CardContent>
        </Card>
      </div>
      <BulkUpdateStatusDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        onConfirm={(newStatus) => {
          bulkUpdateMutation.mutate({ ids: Array.from(selectedPuppyIds), status: newStatus });
        }}
        isUpdating={bulkUpdateMutation.isPending}
        selectedCount={selectedPuppyIds.size}
      />
    </>
  );
};

export default UnifiedManagementHub;
