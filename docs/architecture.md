# Application Architecture

This document outlines the architecture of the FlashSpark application, a Next.js-based platform for creating and taking educational quizzes.

## Frontend

The frontend is built with **Next.js**, a React framework that enables features like server-side rendering and static site generation. We use **TypeScript** for type safety and improved developer experience. The UI is styled with **Tailwind CSS**, and we use a component library based on **shadcn/ui** to create a consistent and accessible user interface.

## Backend

The backend is powered by **Firebase**, a comprehensive platform that provides several key services:

*   **Firebase Authentication:** We use Firebase Authentication to manage user sign-up, sign-in, and session management. We have enabled **Google Authentication** as the primary sign-in method.
*   **Firestore:** Firestore is our NoSQL database. We use it to store all application data, including user profiles, quizzes, flashcards, and progress.
*   **Firebase Admin SDK:** The backend uses the Firebase Admin SDK to perform privileged operations, such as creating custom user claims for role-based access control.

## Data Model

Our data is stored in Firestore using a collection-based NoSQL structure. The primary collections are `users`, `flashcard_sets`, and `quizzes`.

*   **Users:** The `users` collection stores user profile information, including their name, email, and assigned role (`child`, `parent`, or `admin`). Each document is keyed by the user's unique Firebase UID.

*   **Flashcard Sets:** The `flashcard_sets` collection contains documents for each set of flashcards. A set document includes information like the title, subject, and the UID of the parent or admin who created it. Each `flashcard_set` document contains a sub-collection of `flashcards`.

*   **Flashcards:** Each `flashcard` document represents a single card and has two primary fields: `front` (for the term or question) and `back` (for the definition or answer).

*   **Quizzes:** The `quizzes` collection stores the results of quiz attempts. A quiz is dynamically generated from a `flashcard_set`. The multiple-choice answers for a quiz are generated on-the-fly, using the `back` of the correct flashcard as the right answer and distracting options from the `back` of other flashcards in the same set. The quiz results, including the user's answers and score, are stored in a `quiz` document.

## Authentication and Authorization

Authentication is handled on the client-side by the Firebase Authentication library. Once a user signs in, their authentication state is managed by the Firebase SDK.

Authorization is implemented using a role-based access control (RBAC) system.

### User Roles

We have three distinct user roles, each with a specific set of permissions:

*   **Child:** The `child` role is for the primary users of the application. Children can study flashcard sets that are assigned to them and take quizzes. They cannot create or manage content.
*   **Parent:** The `parent` role is for users who manage content for children. Parents can create new user accounts for their children, create and manage `flashcard_sets`, and view the progress and activity of their children.
*   **Admin:** The `admin` role is for administrative purposes. Admins have all the permissions of a parent, but they can also view and manage all users and content in the system.

### Implementation

When a new user is created, they are assigned a role. This role is stored as a custom claim in their Firebase Authentication token. This allows us to securely verify the user's role on both the client and the server.

On the frontend, we can access the user's role from the authentication token to conditionally render UI elements and control access to certain pages or features.

On the backend, we use **Firestore Security Rules** to enforce access control at the database level. These rules check the user's role from their authentication token before allowing any read, write, or delete operations. This ensures that users can only access the data they are authorized to see.

This combination of client-side UI control and server-side security rules provides a robust and secure authorization system.