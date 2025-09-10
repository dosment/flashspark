
import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-bold font-headline text-primary-foreground">
        Generating Your Quiz...
      </h1>
      <p className="text-muted-foreground mt-2">
        Our AI is crafting the perfect questions for you!
      </p>
    </div>
  );
}
