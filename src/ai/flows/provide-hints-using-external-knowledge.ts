'use server';
/**
 * @fileOverview A flow that provides AI-generated hints incorporating facts from external knowledge, at a level of detail appropriate for an 11-year-old.
 *
 * - provideHints - A function that generates hints for a given question.
 * - ProvideHintsInput - The input type for the provideHints function.
 * - ProvideHintsOutput - The return type for the provideHints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideHintsInputSchema = z.object({
  question: z.string().describe('The flashcard question to provide hints for.'),
  subject: z.string().describe('The subject of the question (e.g., Math, Science, History).'),
});
export type ProvideHintsInput = z.infer<typeof ProvideHintsInputSchema>;

const ProvideHintsOutputSchema = z.object({
  hint: z.string().describe('An AI-generated hint incorporating facts from external knowledge, at a level of detail appropriate for an 11-year-old.'),
});
export type ProvideHintsOutput = z.infer<typeof ProvideHintsOutputSchema>;

export async function provideHints(input: ProvideHintsInput): Promise<ProvideHintsOutput> {
  return provideHintsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideHintsPrompt',
  input: {schema: ProvideHintsInputSchema},
  output: {schema: ProvideHintsOutputSchema},
  prompt: `You are an AI assistant helping an 11-year-old student understand a flashcard question.
  The question is about the subject: {{{subject}}}.
  Provide a helpful hint that incorporates facts from external knowledge, explained in a way that is easy for an 11-year-old to understand.

  Question: {{{question}}}

  Hint: `,
});

const provideHintsFlow = ai.defineFlow(
  {
    name: 'provideHintsFlow',
    inputSchema: ProvideHintsInputSchema,
    outputSchema: ProvideHintsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
