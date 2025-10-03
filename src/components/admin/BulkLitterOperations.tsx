import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, Package, ArrowRight } from "lucide-react";
import { Litter, Puppy, PuppyStatus } from "@/types/api";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
import { PuppyCreationData } from '@/api/adminApi';

interface BulkLitterOperationsProps {
  litter: Litter;
  puppies: Puppy[];
}

const BulkLitterOperations: React.FC<BulkLitterOperationsProps> = ({ litter, puppies }) => {
  const queryClient = useQueryClient();

  const litterPuppies = puppies.filter(puppy => puppy.litter_id === litter.id);
  const notReadyPuppies = litterPuppies.filter(puppy => puppy.status === 'Not For Sale');
  const availablePuppies = litterPuppies.filter(puppy => puppy.status === 'Available');

  const publishAllMutation = useMutation({
    mutationFn: async () => {
      const puppyIds = notReadyPuppies.map(p => p.id);
      if (puppyIds.length === 0) {
        toast.info("No puppies are marked as 'Not For Sale' to publish.");
        return { updatedCount: 0 };
      }
      return adminApi.bulkUpdatePuppiesStatus(puppyIds, 'Available' as PuppyStatus);
    },
    onSuccess: (data) => {
      if (data.updatedCount > 0) {
        toast.success(`${data.updatedCount} puppies have been published and are now available!`);
        queryClient.invalidateQueries({ queryKey: ['puppies'] });
        queryClient.invalidateQueries({ queryKey: ['litters'] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish puppies: ${error.message}`);
    },
  });

  const createFromLitterMutation = useMutation({
    mutationFn: async (count: number) => {
      const baseData = {
        breed: litter.breed,
        litter_id: litter.id,
        status: 'Available' as PuppyStatus,
        birth_date: litter.date_of_birth,
      };
      
      const puppiesData: PuppyCreationData[] = Array.from({ length: count }, (_, index) => ({
        ...baseData,
        name: `${litter.name} Puppy ${index + 1}`,
        gender: index % 2 === 0 ? 'Male' : 'Female',
        description: `Beautiful ${litter.breed} puppy from the ${litter.name} litter.`,
        price: 1500, // Example price
      }));

      return adminApi.bulkCreatePuppies(puppiesData);
    },
    onSuccess: (data) => {
      toast.success(`${data.createdCount} puppies created from litter!`);
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      queryClient.invalidateQueries({ queryKey: ['litters'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create puppies: ${error.message}`);
    },
  });

  if (litterPuppies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Litter Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">No puppies found in this litter.</p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Actions:</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => createFromLitterMutation.mutate(4)}
                disabled={createFromLitterMutation.isPending}
              >
                Create 4 Puppies
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => createFromLitterMutation.mutate(6)}
                disabled={createFromLitterMutation.isPending}
              >
                Create 6 Puppies
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => createFromLitterMutation.mutate(8)}
                disabled={createFromLitterMutation.isPending}
              >
                Create 8 Puppies
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Bulk Litter Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-muted-foreground">{litterPuppies.length}</div>
            <div className="text-sm text-muted-foreground">Total Puppies</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{notReadyPuppies.length}</div>
            <div className="text-sm text-muted-foreground">Not Ready</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{availablePuppies.length}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Status Overview</h4>
              <p className="text-sm text-muted-foreground">Current status of all puppies in this litter</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {litterPuppies.map(puppy => (
              <div key={puppy.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {puppy.status === 'Available' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{puppy.name}</span>
                </div>
                <Badge variant={puppy.status === 'Available' ? 'default' : 'secondary'}>
                  {puppy.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {notReadyPuppies.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Publish All Puppies</h4>
                  <p className="text-sm text-muted-foreground">
                    Convert {notReadyPuppies.length} "Not For Sale" puppies to "Available" status
                  </p>
                </div>
                <Button 
                  onClick={() => publishAllMutation.mutate()}
                  disabled={publishAllMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Publish All ({notReadyPuppies.length})
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkLitterOperations;