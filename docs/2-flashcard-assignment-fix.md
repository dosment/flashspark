# Prompt: Implement Flashcard Assignment Mechanism

## The Problem
Our `blueprint.md` and `architecture.md` documents specify that Children study flashcard sets "assigned to them." However, the `flashcard_sets` collection in Firestore has no mechanism to track these assignments. Without this, we cannot control which child sees which set of flashcards, making the feature incomplete.

## The Task
Your goal is to implement a system that allows Parents to assign flashcard sets to their specific Children and enforce these assignments with security rules.

### 1. Update the `flashcard_sets` Data Model
- Modify the `flashcard_sets` collection to include a new field: `assignedTo`.
- This field should be an **array** that will store the UIDs of the Children to whom the set is assigned.

### 2. Create a User Interface for Assignments
- In the Parent-facing dashboard, where `flashcard_sets` are managed, you must provide a UI element (e.g., a multi-select dropdown, a list of checkboxes) that allows a Parent to select which of their Children a flashcard set is assigned to.
- The list of children should be populated from the Parent's own linked children (as defined by the `parentId` relationship).
- Saving this form should update the `assignedTo` array in the corresponding `flashcard_set` document in Firestore.

### 3. Update Firestore Security Rules
- Modify the security rules for the `flashcard_sets` collection.
- A user with the 'Child' role should only be allowed to **read** a `flashcard_set` document if their `request.auth.uid` is present in the `assignedTo` array of that document.
- A 'Parent' should only be able to read/write sets that they own (e.g., where `request.auth.uid == resource.data.ownerId`).

### Acceptance Criteria
- A Parent can view a list of their children and assign/unassign a flashcard set to one or more of them.
- A Child user, when logged in, can only see and access the flashcard sets that have been explicitly assigned to them.
- A Child cannot access a flashcard set even if their Parent created it, unless they are in the `assignedTo` array.
- The system works correctly for multiple children under one parent.