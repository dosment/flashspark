# **App Name**: FlashSpark

## Core Features:

- **Primary Study Method (Flashcards):** The application's main focus is on learning through flashcards. This includes vocabulary (term and definition) and math facts.
- **Flashcard Creation:** Parents can manually create flashcards by providing a question/term for the front and an answer/definition for the back.
- **AI-Powered Flashcard Generation:** Parents can paste a block of text and have the AI automatically extract key terms and definitions to generate a set of flashcards.
- **Flashcard Study Mode:** Children can review flashcards one by one, flipping them to self-test their knowledge.
- **Knowledge Testing (Quizzes):** After studying, children can take a quiz to test their learning. Quizzes are dynamically generated from the flashcard sets and present questions in a multiple-choice format.
- **Progress Tracking:** Tracks quiz performance, including correct answers, response time, and number of attempts. This data is stored in Firestore.
- **Subject Selection:** Allows users to organize and select flashcard sets by subject (e.g., Math, Science, History).
- **User Management & Roles:** Supports Parent, Child, and Admin roles with distinct permissions for content creation and access.
- **Customization:** Includes features like avatar uploads and an age-appropriate, engaging user interface.

## User Roles:

- **Child:** Can study flashcard sets and take quizzes assigned to them, and view their achievements.
- **Parent:** Can create and manage flashcard sets for their children, and view their children's activity.
- **Admin:** Has all the capabilities of a parent, but can also view the activity of all users in the system. This role is for administrative and monitoring purposes.

## Style Guidelines:

- Primary color: Vibrant blue (#64B5F6), evoking feelings of intelligence and reliability.
- Background color: Very light blue (#E3F2FD) creating a calm and inviting learning environment.
- Accent color: Energetic orange (#FFB74D) used for interactive elements and to highlight important information.
- Font: 'PT Sans', a humanist sans-serif that is easy to read and has a modern, friendly feel. It will be used for both headlines and body text.
- Use clear, colorful, and age-appropriate icons for subjects and features. Should have a playful, hand-drawn feel.
- The layout should be clean and uncluttered, with a clear visual hierarchy. Employ a card-based design for lessons and flashcards.
- Ensure the application works and displays flawlessly on a 720p screen and an iPhone SE screen.
- Subtle animations and transitions to provide feedback and keep the user engaged. Avoid distracting or unnecessary animations.
- Celebration animations when quizzes receive a 100% score