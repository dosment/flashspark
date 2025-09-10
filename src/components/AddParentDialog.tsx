
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, ShieldPlus } from 'lucide-react';
import { addParentAction } from '@/app/actions';

export function AddParentDialog({ onParentAdded }: { onParentAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsAdding(true);

    const result = await addParentAction(email);

    if (result.success) {
      toast({
        title: 'Parent Added!',
        description: `${email} has been promoted to a parent role.`,
      });
      onParentAdded();
      setIsOpen(false);
      setEmail('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShieldPlus className="mr-2" />
          Add Parent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleAddParent}>
          <DialogHeader>
            <DialogTitle>Add Parent Account</DialogTitle>
            <DialogDescription>
              Enter the Google email address of the user you wish to promote to a parent. They must have already signed up for the app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="newparent@example.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <LoaderCircle className="animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Parent'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
