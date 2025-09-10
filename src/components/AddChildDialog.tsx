
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function AddChildDialog({ onChildAdded }: { onChildAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();

  const resetForm = () => {
    setEmail('');
    setName('');
    setGradeLevel('');
    setDateOfBirth(undefined);
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !dateOfBirth) return;
    setIsAdding(true);

    const result = await addChildAction({
      email,
      name,
      gradeLevel,
      dateOfBirth: format(dateOfBirth, 'yyyy-MM-dd')
    });

    if (result.success) {
      toast({
        title: 'Child Account Created!',
        description: `An account for ${email} has been created. They can now log in with their Google account.`,
      });
      onChildAdded();
      setIsOpen(false);
      resetForm();
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      setIsOpen(open);
    }}>
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
                Enter your child's details to create an account for them. They can then sign in using that Google account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Child's Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Child's Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="child@example.com" required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateOfBirth && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={setDateOfBirth}
                            initialFocus
                             disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                            }
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level</Label>
                    <Input id="grade" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="e.g., 5th Grade" />
                </div>
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
