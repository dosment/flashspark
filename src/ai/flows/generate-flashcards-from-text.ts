'use server';
/**
 * @fileOverview Generates flashcards from a given block of text.
 *
 * - generateFlashcardsFromText - A function that generates flashcards by parsing the provided text.
 * - GenerateFlashcardsFromTextInput - The input type for the generateFlashcardsFromText function.
 * - GenerateFlashcardsOutput - The return type, which is the same as the topic-based generator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateFlashcardsOutputSchema, GenerateFlashcardsOutput } from './generate-flashcards-from-topic';

const GenerateFlashcardsFromTextInputSchema = z.object({
  text: z.string().describe('A block of text containing study material, questions, or facts from which to generate flashcards.'),
  numFlashcards: z.number().optional().describe('The desired number of flashcards to generate from the text.'),
});
export type GenerateFlashcardsFromTextInput = z.infer<typeof GenerateFlashcardsFromTextInputSchema>;


export async function generateFlashcardsFromText(input: GenerateFlashcardsFromTextInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFromTextFlow(input);
}

const generateFlashcardsFromTextPrompt = ai.definePrompt({
  name: 'generateFlashcardsFromTextPrompt',
  input: {schema: GenerateFlashcardsFromTextInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an AI assistant designed to generate educational flashcards from a provided block of text.
  
  Analyze the following text and create a set of flashcards. Each flashcard should have a question, the correct answer, and a list of plausible options (including the correct answer and several distractors).

  The questions should be based on the key information, concepts, and facts presented in the text.
  
  Generate {{numFlashcards}} flashcards if specified, otherwise generate a suitable number of flashcards based on the text length.

  Provided Text:
  """
  {{{text}}}
  """

  Format the output as a JSON object with a "flashcards" array. Each flashcard in the array should have the following fields:
  - question: The question to display on the flashcard.
  - answer: The correct answer to the question.
  - options: An array of possible answers, including the correct answer and distractors. Make sure the correct answer is included in the options.
  - hint: A hint to help the user answer the question. Only include a hint if it's necessary.
  `,
});

const generateFlashcardsFromTextFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromTextFlow',
    inputSchema: GenerateFlashcardsFromTextInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await generateFlashcardsFromTextPrompt(input);
    return output!;
  }
);
