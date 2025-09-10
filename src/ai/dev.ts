import { config } from 'dotenv';
config();

import '@/ai/flows/generate-flashcards-from-topic.ts';
import '@/ai/flows/provide-hints-using-external-knowledge.ts';