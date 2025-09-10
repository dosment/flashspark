'use client';

import { useEffect, useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AppUser, Quiz } from '@/lib/types';
import { getManagedUsersAction, updateQuizAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

interface AssignQuizDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    quiz: Quiz;
}

export default function AssignQuizDialog({ isOpen, onOpenChange, quiz }: AssignQuizDialogProps) {
    const [children, setChildren] = useState<AppUser[]>([]);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getManagedUsersAction()
                .then(users => {
                    setChildren(users);
                    setSelectedChildren(quiz.assignedTo || []);
                })
                .catch(err => {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch children.' });
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, quiz.assignedTo, toast]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateQuizAction(quiz.id!, { assignedTo: selectedChildren });
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Quiz assignments updated.' });
            onOpenChange(false);
        }
        setIsSaving(false);
    };

    const handleCheckboxChange = (childId: string, checked: boolean) => {
        setSelectedChildren(prev =>
            checked ? [...prev, childId] : prev.filter(id => id !== childId)
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign "{quiz.title}" to...</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : children.length === 0 ? (
                    <p className="text-center text-muted-foreground">You don't have any children to assign this quiz to.</p>
                ) : (
                    <div className="space-y-4 py-4">
                        {children.map(child => (
                            <div key={child.uid} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`child-${child.uid}`}
                                    checked={selectedChildren.includes(child.uid)}
                                    onCheckedChange={(checked) => handleCheckboxChange(child.uid, !!checked)}
                                />
                                <Label htmlFor={`child-${child.uid}`} className="flex-1 cursor-pointer">
                                    {child.name || child.email}
                                </Label>
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isLoading || isSaving}>
                        {isSaving && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />} Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}