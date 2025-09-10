
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
import { Calendar as CalendarIcon, LoaderCircle, UserPlus } from 'lucide-react';
import { addChildAction } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const gradeLevels = [
    "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"
];

export function AddChildDialog({ onChildAdded }: { onChildAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !gradeLevel) return;
    setIsAdding(true);

    const result = await addChildAction({
        email,
        password,
        gradeLevel,
        dateOfBirth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : undefined,
    });

    if (result.success) {
      toast({
        title: 'Child Added!',
        description: `Account for ${email} has been successfully created.`,
      });
      onChildAdded();
      setIsOpen(false);
      setEmail('');
      setPassword('');
      setGradeLevel('');
      setDateOfBirth(undefined);
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
              Create a new account for your child. They can use this email and password to log in.
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
            <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Must be at least 6 characters"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="grade-level">Grade Level</Label>
                 <Select onValueChange={setGradeLevel} value={gradeLevel} required>
                    <SelectTrigger id="grade-level">
                        <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                    <SelectContent>
                        {gradeLevels.map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth (Optional)</Label>
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
                        captionLayout="dropdown-buttons"
                        fromYear={1990}
                        toYear={new Date().getFullYear()}
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
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

    