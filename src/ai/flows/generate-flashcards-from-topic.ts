
'use server';
/**
 * @fileOverview Generates flashcards from a given topic.
 *
 * - generateFlashcards - A function that generates flashcards based on the provided topic.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  topic: z.string().describe('The subject or topic for which to generate flashcards.'),
  numFlashcards: z.number().describe('The number of flashcards to generate.'),
  gradeLevel: z.string().optional().describe("The child's grade level, e.g., '5th Grade'."),
  age: z.number().optional().describe("The child's age."),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe('The question to display on the flashcard.'),
  answer: z.string().describe('The correct answer to the question.'),
  options: z.array(z.string()).describe('An array of possible answers, including the correct answer and distractors.'),
  hint: z.string().optional().describe('A hint to help the user answer the question.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const generateFlashcardsPrompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an AI assistant designed to generate educational flashcards.
  
  {{#if gradeLevel}}
  The target audience is a child in {{gradeLevel}}. 
  {{/if}}
  {{#if age}}
  The child is {{age}} years old.
  {{/if}}

  {{#if gradeLevel}}
  Please tailor the complexity and vocabulary of the questions and answers to be appropriate for a {{gradeLevel}} student.
  {{else}}
  The target audience is an 11-year-old.
  {{/if}}
  
  Generate {{numFlashcards}} flashcards on the topic of "{{topic}}".  Each flashcard should have a question, the correct answer, a list of options (including the correct answer and distractors), and an optional hint.

  Format the output as a JSON object with a "flashcards" array. Each flashcard in the array should have the following fields:
  - question: The question to display on the flashcard.
  - answer: The correct answer to the question.
  - options: An array of possible answers, including the correct answer and distractors. Make sure the correct answer is included in the options.
  - hint: A hint to help the user answer the question. Only include a hint if it's necessary.
  `,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await generateFlashcardsPrompt(input);
    return output!;
  }
);
