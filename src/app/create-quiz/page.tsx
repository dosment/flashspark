
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import type { Flashcard, QuizType, AppUser } from '@/lib/types';
import { X, LoaderCircle, Wand2, Save, FileText } from 'lucide-react';
import { generateFlashcards } from '@/ai/flows/generate-flashcards-from-topic';
import { generateFlashcardsFromText } from '@/ai/flows/generate-flashcards-from-text';
import { useAuth } from '@/hooks/use-auth';
import { saveQuizAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function CreateQuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const isAiMode = searchParams.get('ai') === 'true';

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiText, setAiText] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizType, setQuizType] = useState<QuizType>('standard');
  const [activeView, setActiveView] = useState<'manual' | 'aiTopic' | 'aiText'>('manual');
  
  useEffect(() => {
    if (isAiMode) {
      console.log('[CreateQuiz] AI mode detected from URL');
      setActiveView('aiTopic');
      setQuizType('vocabulary');
    }
  }, [isAiMode]);

  useEffect(() => {
    // This is a client-side convenience redirect.
    // The critical security check is on the server action.
    if (!loading && user && user.role !== 'admin') {
      console.warn('[CreateQuiz] Non-admin user detected, redirecting to dashboard.');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CreateQuiz] Adding flashcard manually.');
    if (question && answer && options.every(opt => opt.trim() !== '')) {
      const newFlashcard: Flashcard = {
        question,
        answer,
        options: [...options, answer], 
      };
      setFlashcards([...flashcards, newFlashcard]);
      console.log('[CreateQuiz] Flashcard added, resetting form.');
      setQuestion('');
      setAnswer('');
      setOptions(['', '', '']);
    } else {
        console.warn('[CreateQuiz] Add flashcard validation failed.');
    }
  };
  
  const handleAiGenerateFromTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic) return;
    setIsGenerating(true);
    console.log(`[CreateQuiz] Generating flashcards from topic: "${aiTopic}"`);
    setQuizTitle(aiTopic);
    setQuizType('vocabulary');

    const gradeLevel = (user as AppUser)?.gradeLevel;
    const dob = (user as AppUser)?.dateOfBirth;
    let age;
    if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    }
    console.log('[CreateQuiz] AI generation params:', { topic: aiTopic, gradeLevel, age });

    try {
      const result = await generateFlashcards({ 
          topic: aiTopic, 
          numFlashcards: 10,
          ...(gradeLevel && { gradeLevel }),
          ...(age && { age }),
      });
      setFlashcards(result.flashcards);
      setActiveView('manual'); // Hide generation UI
      console.log(`[CreateQuiz] AI generation successful, ${result.flashcards.length} flashcards created.`);
      toast({ title: "AI Complete!", description: `Generated ${result.flashcards.length} flashcards about ${aiTopic}.` });
    } catch (error) {
      console.error("[CreateQuiz] Failed to generate flashcards from topic", error);
      toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not generate flashcards. Please try again." });
    }
    setIsGenerating(false);
  };
  
  const handleAiGenerateFromText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiText) return;
    setIsGenerating(true);
    console.log(`[CreateQuiz] Generating flashcards from text.`);
    setQuizTitle('Quiz from My Notes');
    setQuizType('standard');

    try {
      const result = await generateFlashcardsFromText({ 
          text: aiText,
          numFlashcards: 10,
      });
      setFlashcards(result.flashcards);
      setActiveView('manual'); // Hide generation UI
       console.log(`[CreateQuiz] AI generation from text successful, ${result.flashcards.length} flashcards created.`);
      toast({ title: "AI Complete!", description: `Generated ${result.flashcards.length} flashcards from your text.` });
    } catch (error) {
      console.error("[CreateQuiz] Failed to generate flashcards from text", error);
      toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not generate flashcards. Please try again." });
    }
    setIsGenerating(false);
  };


  const handleSaveQuiz = async () => {
    if (flashcards.length === 0 || !quizTitle) {
        console.warn('[CreateQuiz] Save validation failed: No flashcards or title.');
        toast({ variant: "destructive", title: "Cannot Save Quiz", description: "Please add at least one flashcard and a title." });
        return;
    }
    setIsSaving(true);
    console.log(`[CreateQuiz] Saving quiz with title: "${quizTitle}"`);
    const result = await saveQuizAction({ title: quizTitle, flashcards, quizType });
    if (result.success) {
        console.log(`[CreateQuiz] Quiz saved successfully with id: ${result.quizId}`);
        toast({ title: "Quiz Saved!", description: "Your new quiz has been saved to your dashboard." });
        router.push('/dashboard');
    } else {
        console.error(`[CreateQuiz] Save failed:`, result.error);
        toast({ variant: "destructive", title: "Save Failed", description: result.error });
    }
    setIsSaving(false);
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeFlashcard = (index: number) => {
    console.log(`[CreateQuiz] Removing flashcard at index: ${index}`);
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };
  
  if (loading || !user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-headline text-primary-foreground">
          Loading...
        </h1>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <section className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8 gap-2 flex-wrap">
                <Button variant={activeView === 'manual' && flashcards.length === 0 ? 'default' : 'outline'} onClick={() => setActiveView('manual')}>Create Manually</Button>
                <Button variant={activeView === 'aiTopic' ? 'default' : 'outline'} onClick={() => {setActiveView('aiTopic'); setQuizType('vocabulary')}}>Generate from Topic</Button>
                <Button variant={activeView === 'aiText' ? 'default' : 'outline'} onClick={() => {setActiveView('aiText'); setQuizType('standard')}}>Generate from Text</Button>
            </div>

         {activeView === 'aiTopic' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <Wand2 />
                  Generate Quiz from Topic
                </CardTitle>
                 <CardDescription>Enter a topic and let our AI create a vocabulary quiz for you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAiGenerateFromTopic} className="flex gap-2">
                    <Input
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g., 'The Solar System'"
                        required
                        disabled={isGenerating}
                    />
                    <Button type="submit" disabled={isGenerating || isSaving}>
                        {isGenerating ? <LoaderCircle className="animate-spin" /> : "Generate"}
                    </Button>
                </form>
              </CardContent>
            </Card>
          )} 

          {activeView === 'aiText' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <FileText />
                  Generate Quiz from Text
                </CardTitle>
                 <CardDescription>Paste in your study material, notes, or any text, and let AI create flashcards for you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAiGenerateFromText} className="space-y-4">
                    <Textarea
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                        placeholder="Paste your text here... for example: 'The mitochondria is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP).'"
                        required
                        disabled={isGenerating}
                        rows={10}
                    />
                    <Button type="submit" disabled={isGenerating || isSaving || !aiText} className="w-full">
                        {isGenerating ? <LoaderCircle className="animate-spin" /> : "Generate Flashcards"}
                    </Button>
                </form>
              </CardContent>
            </Card>
          )}
          
          {activeView === 'manual' && flashcards.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Create Your Custom Quiz</CardTitle>
                <CardDescription>Build a quiz from scratch with your own questions and answers.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFlashcard} className="space-y-6">
                  <div className="space-y-3">
                      <Label>Quiz Type</Label>
                      <RadioGroup
                        onValueChange={(value) => setQuizType(value as QuizType)}
                        className="flex gap-4"
                        value={quizType}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="r1" />
                          <Label htmlFor="r1">Standard (Q&A)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="vocabulary" id="r2" />
                          <Label htmlFor="r2">Vocabulary (Term/Definition)</Label>
                        </div>
                      </RadioGroup>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input
                      id="quiz-title"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="e.g., Weekly Science Review"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question">{quizType === 'vocabulary' ? 'Definition' : 'Question'}</Label>
                    <Textarea
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={quizType === 'vocabulary' ? 'e.g., The star at the center of our solar system.' : 'e.g., What is the capital of France?'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">{quizType === 'vocabulary' ? 'Term' : 'Correct Answer'}</Label>
                    <Input
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={quizType === 'vocabulary' ? 'e.g., Sun' : 'e.g., Paris'}
                      required
                    />
                  </div>
                  <div className="space-y-4">
                     <Label>Distractor Options</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {options.map((option, index) => (
                              <Input
                              key={index}
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              required
                              />
                          ))}
                      </div>
                  </div>
                  <Button type="submit" disabled={isSaving}>Add Flashcard</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {flashcards.length > 0 && (
            <div className="mt-8">
               <div className="space-y-2 mb-4">
                <Label htmlFor="quiz-title-final">Quiz Title</Label>
                <Input
                  id="quiz-title-final"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter a title for your quiz"
                  required
                  className="text-lg font-semibold"
                />
              </div>
              <h2 className="text-xl font-bold font-headline mb-4">Your Flashcards ({flashcards.length})</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                {flashcards.map((card, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{index + 1}. {card.question}</p>
                        <p className="text-sm text-green-600">Answer: {card.answer}</p>
                        <p className='text-xs text-muted-foreground'>Options: {card.options.join(', ')}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFlashcard(index)} disabled={isSaving}>
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button 
                onClick={handleSaveQuiz} 
                className="mt-6 w-full" 
                size="lg"
                disabled={flashcards.length === 0 || isSaving || !quizTitle}>
                {isSaving ? <LoaderCircle className="animate-spin" /> : <><Save className="mr-2"/> Save Quiz</>}
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><LoaderCircle className="w-12 h-12 animate-spin text-primary" /></div>}>
      <CreateQuizPageContent />
    </Suspense>
  )
}
