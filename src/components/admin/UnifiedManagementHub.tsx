import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { adminApi } from '@/api';
import { Puppy, Litter } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Heart, ListTree, Dog, ChevronsRight, Trash2, Edit, PlusCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import EntityDetailView from './EntityDetailView';
import BulkUpdateStatusDialog from './BulkUpdateStatusDialog';
import BulkAddPuppiesDialog from './BulkAddPuppiesDialog';
import BulkPuppyCreator from './BulkPuppyCreator';
import LitterForm from './LitterForm';
import StudDogForm from './StudDogForm';
import PuppyForm from './PuppyForm';
import ParentForm from './ParentForm';
import { PuppyStatus } from '@/types';

/**
 * @interface LitterWithPuppies
 * @description Extends the Litter type to include an array of associated puppy objects.
 */
interface LitterWithPuppies extends Litter {
  puppies: Puppy[];
}

/**
 * @component UnifiedManagementHub
 * @description A central management interface that provides a hierarchical view of litters and puppies,
 * as well as lists of stud dogs and unassigned puppies. It supports creating, viewing, editing,
 * and performing bulk actions on these entities.
 * @returns {React.ReactElement} The rendered unified management hub.
 */
const UnifiedManagementHub = () => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'puppy' | 'litter' | 'stud' | 'parent', id: string } | null>(null);
  const [creationMode, setCreationMode] = useState<'litter' | 'stud_dog' | 'puppy' | 'parent' | null>(null);
  const [selectedPuppyIds, setSelectedPuppyIds] = useState<Set<string>>(new Set());
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [bulkAddLitterId, setBulkAddLitterId] = useState<string | null>(null);
  const [puppiesToCreate, setPuppiesToCreate] = useState(0);
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

  const { data: studDogsData, isLoading: studDogsLoading, isError: studDogsIsError } = useQuery({
      queryKey: ['stud_dogs'],
      queryFn: () => adminApi.getStudDogs(),
      staleTime: 5 * 60 * 1000,
  });

  const { data: parentsData, isLoading: parentsLoading, isError: parentsIsError } = useQuery({
    queryKey: ['parents'],
    queryFn: () => adminApi.getAllParents(),
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

  const bulkCreateMutation = useMutation({
    mutationFn: (puppiesData: any[]) => adminApi.bulkCreatePuppies(puppiesData),
    onSuccess: (data) => {
        toast.success(`${data.createdCount} new puppies have been created successfully!`);
        queryClient.invalidateQueries({ queryKey: ['puppies'] });
        setPuppiesToCreate(0);
        setBulkAddLitterId(null);
    },
    onError: (error) => {
        toast.error(`Failed to create puppies: ${error.message}`);
    }
  });

  /**
   * @property {object} hierarchicalData
   * @description A memoized data structure that organizes puppies under their respective litters.
   */
  const { hierarchicalData, unassignedPuppies } = useMemo(() => {
    if (!puppiesData?.puppies || !littersData?.litters) {
      return { hierarchicalData: [], unassignedPuppies: [] };
    }

    const puppies = puppiesData.puppies;
    const litters = littersData.litters;

    const littersWithPuppies: LitterWithPuppies[] = litters.map(litter => ({
      ...litter,
      puppies: puppies.filter(puppy => (puppy as any).litter_id === litter.id),
    }));

    const assignedPuppyIds = new Set(puppies.filter(p => (p as any).litter_id).map(p => p.id));
    const unassigned = puppies.filter(p => !assignedPuppyIds.has(p.id));

    return { hierarchicalData: littersWithPuppies, unassignedPuppies: unassigned };
  }, [puppiesData, littersData]);

  const isLoading = puppiesLoading || littersLoading || studDogsLoading || parentsLoading;
  const isError = puppiesIsError || littersIsError || studDogsIsError || parentsIsError;

  useEffect(() => {
    const channel = supabase.channel('public-tables');
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'puppies' },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[DEV] Puppy change received!', payload);
          }
          queryClient.invalidateQueries({ queryKey: ['puppies'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'litters' },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[DEV] Litter change received!', payload);
          }
          queryClient.invalidateQueries({ queryKey: ['litters'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stud_dogs' },
        (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[DEV] Stud dog change received!', payload);
          }
          queryClient.invalidateQueries({ queryKey: ['stud_dogs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  /**
   * Handles the selection or deselection of a single puppy.
   * @param {string} puppyId - The ID of the puppy.
   * @param {boolean} isSelected - The new selection state.
   */
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

  /**
   * Handles the selection or deselection of all puppies within a litter.
   * @param {LitterWithPuppies} litter - The litter whose puppies are to be selected/deselected.
   * @param {boolean} isSelected - The new selection state.
   */
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

  /**
   * Renders the bulk action buttons when one or more puppies are selected.
   * @returns {React.ReactElement | null} The bulk actions card, or null if no puppies are selected.
   */
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

  /**
   * Renders the content of the sidebar, including the hierarchical list of litters and puppies.
   * @returns {React.ReactElement} The rendered sidebar content.
   */
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

    const handleAddNewLitter = () => {
        setSelectedEntity(null);
        setCreationMode('litter');
    }

    const handleAddNewStudDog = () => {
        setSelectedEntity(null);
        setCreationMode('stud_dog');
    }

    const handleAddNewPuppy = () => {
        setSelectedEntity(null);
        setCreationMode('puppy');
    }

    const handleAddNewParent = () => {
        setSelectedEntity(null);
        setCreationMode('parent');
    }

    return (
      <div className="p-2 space-y-2">
        <div className="flex justify-between items-center px-2">
            <h3 className="font-semibold text-lg flex items-center"><ListTree className="w-5 h-5 mr-2" /> Litters</h3>
            <Button variant="ghost" size="icon" onClick={handleAddNewLitter}>
                <PlusCircle className="h-5 w-5" />
            </Button>
        </div>
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
         <div className="flex justify-between items-center px-2 pt-4">
            <h3 className="font-semibold text-lg flex items-center"><Heart className="w-5 h-5 mr-2" /> Parents</h3>
            <Button variant="ghost" size="icon" onClick={() => setSelectedEntity({ type: 'parent', id: 'new' })}>
                <PlusCircle className="h-5 w-5" />
            </Button>
        </div>
        {(parentsData?.parents || []).map((parent) => (
            <Button
                key={parent.id}
                variant={selectedEntity?.id === parent.id ? "secondary" : "ghost"}
                className="w-full justify-start ml-2"
                onClick={() => setSelectedEntity({ type: 'parent', id: parent.id })}
            >
                <Heart className={`w-4 h-4 mr-2 ${parent.gender === 'Female' ? 'text-pink-500' : 'text-blue-500'}`} />
                {parent.name} ({parent.gender})
            </Button>
        ))}

         <div className="flex justify-between items-center px-2 pt-4">
            <h3 className="font-semibold text-lg flex items-center"><Dog className="w-5 h-5 mr-2" /> Stud Dogs</h3>
            <Button variant="ghost" size="icon" onClick={handleAddNewStudDog}>
                <PlusCircle className="h-5 w-5" />
            </Button>
        </div>
        {(studDogsData?.data || []).map((dog) => (
            <Button
                key={dog.id}
                variant={selectedEntity?.id === dog.id ? "secondary" : "ghost"}
                className="w-full justify-start ml-2"
                onClick={() => setSelectedEntity({ type: 'stud', id: dog.id })}
            >
                <Dog className="w-4 h-4 mr-2" />
                {dog.name}
            </Button>
        ))}

        <div className="flex justify-between items-center px-2 pt-4">
            <h3 className="font-semibold text-lg flex items-center"><Dog className="w-5 h-5 mr-2" /> Unassigned Puppies</h3>
            <Button variant="ghost" size="icon" onClick={handleAddNewPuppy}>
                <PlusCircle className="h-5 w-5" />
            </Button>
        </div>
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
                {creationMode === 'litter' && <LitterForm onClose={() => setCreationMode(null)} isEditMode={false} />}
                {creationMode === 'stud_dog' && <StudDogForm onClose={() => setCreationMode(null)} isEditMode={false} />}
                {creationMode === 'parent' && <ParentForm 
                  formData={{
                    name: '',
                    breed: '',
                    gender: 'Male',
                    description: '',
                    image_urls: [],
                    certifications: [],
                    bloodline_info: '',
                    health_clearances: [],
                    is_active: true
                  }}
                  onInputChange={() => {}}
                  onSelectChange={() => {}}
                  onSubmit={() => {}}
                  onCancel={() => setCreationMode(null)}
                  isEditing={false}
                />}
                {creationMode === 'puppy' ? (
                  <PuppyForm onClose={() => setCreationMode(null)} isEditMode={false} />
                ) : puppiesToCreate > 0 && bulkAddLitterId ? (
                  <BulkPuppyCreator
                    count={puppiesToCreate}
                    litterId={bulkAddLitterId}
                    onClose={() => setPuppiesToCreate(0)}
                    onSave={(puppiesData) => bulkCreateMutation.mutate(puppiesData)}
                    isSaving={bulkCreateMutation.isPending}
                  />
                ) : creationMode === 'litter' ? (
                  <LitterForm onClose={() => setCreationMode(null)} isEditMode={false} />
                ) : creationMode === 'stud_dog' ? (
                  <StudDogForm onClose={() => setCreationMode(null)} isEditMode={false} />
                ) : selectedEntity ? (
                  <EntityDetailView
                    entityId={selectedEntity.id}
                    entityType={selectedEntity.type}
                    puppies={puppiesData?.puppies || []}
                    litters={littersData?.litters || []}
                    studDogs={studDogsData?.data || []}
                    parents={parentsData?.parents || []}
                    onBulkAddPuppies={(litterId) => {
                      setBulkAddLitterId(litterId);
                      setIsBulkAddDialogOpen(true);
                    }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <ListTree className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">Select an Entity</h3>
                    <p>Click on a puppy or litter in the sidebar to view and edit its details, or add a new entity.</p>
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
      <BulkAddPuppiesDialog
        isOpen={isBulkAddDialogOpen}
        onClose={() => setIsBulkAddDialogOpen(false)}
        onConfirm={(count) => {
            setPuppiesToCreate(count);
            setIsBulkAddDialogOpen(false);
            setCreationMode(null);
            setSelectedEntity(null);
        }}
      />
    </>
  );
};

export default UnifiedManagementHub;
