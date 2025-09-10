
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
import { LoaderCircle, UserPlus } from 'lucide-react';
import { addChildAction } from '@/app/actions';

export function AddChildDialog({ onChildAdded }: { onChildAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsAdding(true);

    const result = await addChildAction(email);

    if (result.success) {
      toast({
        title: 'Child Account Created!',
        description: `An account for ${email} has been created. They can now log in with their Google account.`,
      });
      onChildAdded();
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
        <Button>
          <UserPlus className="mr-2" />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleAddChild}>
          <DialogHeader>
            <DialogTitle>Create Child Account</DialogTitle>
            <DialogDescription>
                Enter your child's Google email address to create an account for them. They can then sign in using that Google account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Child's Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="child@example.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isAdding} className="w-full">
              {isAdding ? (
                <>
                  <LoaderCircle className="animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Child Account'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    