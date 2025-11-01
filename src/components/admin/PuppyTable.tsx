import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash, ChevronRight } from "lucide-react";
import { Puppy } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PuppyTableProps {
  puppies: Puppy[];
  onEditPuppy: (puppy: Puppy) => void;
  onDeletePuppy: (id: string) => void;
}

const PuppyTable: React.FC<PuppyTableProps> = ({ puppies, onEditPuppy, onDeletePuppy }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {puppies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No puppies found.
            </CardContent>
          </Card>
        ) : (
          puppies.map((puppy) => (
            <Card
              key={puppy.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onEditPuppy(puppy)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={puppy.photo_url || ''} />
                    <AvatarFallback>{puppy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{puppy.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{puppy.breed}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{puppy.gender}</Badge>
                      <Badge variant="secondary" className="text-xs">{puppy.status}</Badge>
                      {puppy.price && (
                        <Badge variant="default" className="text-xs">${puppy.price}</Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption>A list of your recent puppies.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {puppies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">No puppies found.</TableCell>
            </TableRow>
          ) : (
            puppies.map((puppy) => (
              <TableRow 
                key={puppy.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEditPuppy(puppy)}
              >
                <TableCell className="font-medium">{puppy.name}</TableCell>
                <TableCell>{puppy.breed}</TableCell>
                <TableCell>{puppy.gender}</TableCell>
                <TableCell>{puppy.price}</TableCell>
                <TableCell>{puppy.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPuppy(puppy);
                      }}
                      className="h-9 w-9 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePuppy(puppy.id);
                      }}
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PuppyTable;