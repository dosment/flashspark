# Prompt: Implement Parent-Child Relationship in Data Model

## The Problem
Our `architecture.md` specifies that Parents can view the progress of their own Children. However, our current Firestore data model for the `users` collection lacks any field to create this relationship. This is a critical security and functionality gap that prevents the core feature from working and could lead to data privacy issues.

## The Task
Your goal is to establish a secure and explicit link between Parent and Child user accounts within our Firestore database and enforce it with security rules.

### 1. Update User Creation Logic
- When a user with the 'Parent' role creates a new user account for a 'Child', the new Child's document in the `users` collection **must** include a `parentId` field.
- The value of this `parentId` field must be the UID of the Parent who created the account.

### 2. Update Firestore Security Rules
- **User Data Access:** Modify the security rules for the `users` collection. A user should only be allowed to read another user's document if:
    - They are an 'Admin'.
    - OR they are a 'Parent' and the `request.auth.uid` matches the `parentId` field of the document they are trying to read.
- **Quiz/Progress Data Access:** Modify the security rules for the `quizzes` collection (and any other progress-related collections). A 'Parent' should only be allowed to read quiz documents that belong to their children. This will likely involve a `get` call within the security rules to check the `parentId` of the child who took the quiz.

### Acceptance Criteria
- A Parent can successfully create a Child account, and the `parentId` field is correctly populated in Firestore.
- A logged-in Parent can **only** view the profile information and quiz results of their own Children.
- A Parent **cannot** view data belonging to other Parents or other Children.
- An Admin can view all user and quiz data.