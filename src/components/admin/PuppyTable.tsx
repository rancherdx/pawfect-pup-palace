
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Puppy } from "@/types";
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
              <TableRow key={puppy.id}>
                <TableCell className="font-medium">{puppy.name}</TableCell>
                <TableCell>{puppy.breed}</TableCell>
                <TableCell>{puppy.gender}</TableCell>
                <TableCell>{puppy.price}</TableCell>
                <TableCell>{puppy.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPuppy(puppy)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePuppy(puppy.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
