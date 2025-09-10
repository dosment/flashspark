# Prompt: Final End-to-End Verification QA

## The Problem
After implementing the fixes for the data model, flashcard assignments, and general consistency, we need a final, comprehensive end-to-end test to ensure all changes work together correctly and have secured the application as intended. This prompt simulates a real-world user journey to validate the core functionality from multiple user perspectives.

## The Task
Your goal is to perform a full system test by acting as a Parent, multiple Children, and an Admin. Follow this script precisely. A failure at any step indicates a critical bug.

---

### **Test Script**

#### **Part 1: Parent Setup**
1.  **Create Accounts:**
    *   Sign up for a new account with the **Parent** role.
    *   From the Parent dashboard, create **two** separate Child accounts: `Child_One` and `Child_Two`.
2.  **Verify Parent View:**
    *   Confirm that in your Parent dashboard, you can see `Child_One` and `Child_Two`, but no other users.
3.  **Create Content:**
    *   Create a new flashcard set named `Science_Set`.
    *   Create a second flashcard set named `History_Set`.
4.  **Assign Content:**
    *   Assign the `Science_Set` **only to `Child_One`**.
    *   Assign the `History_Set` **only to `Child_Two`**.

*Expected Outcome: The setup should complete without errors. The assignments must be saved correctly.* 

#### **Part 2: Child One's Experience**
1.  **Log In:**
    *   Log out of the Parent account and log in as `Child_One`.
2.  **Verify Access:**
    *   You should see and be able to study the `Science_Set`.
    *   You should **NOT** see the `History_Set` anywhere in the UI.
3.  **Take Quiz:**
    *   Take a quiz based on the `Science_Set` and complete it.

*Expected Outcome: `Child_One` can only access content specifically assigned to them.* 

#### **Part 3: Child Two's Experience**
1.  **Log In:**
    *   Log out and log in as `Child_Two`.
2.  **Verify Access:**
    *   You should see and be able to study the `History_Set`.
    *   You should **NOT** see the `Science_Set` anywhere in the UI.
3.  **Take Quiz:**
    *   Take a quiz based on the `History_Set` and complete it.

*Expected Outcome: `Child_Two` can only access content specifically assigned to them.* 

#### **Part 4: Final Parent Verification**
1.  **Log In:**
    *   Log out and log back in as the **Parent**.
2.  **Check Progress:**
    *   Navigate to the progress or activity dashboard.
    *   Verify that you can see the completed quiz results for `Child_One` from the `Science_Set`.
    *   Verify that you can see the completed quiz results for `Child_Two` from the `History_Set`.
    *   Crucially, verify there is **no crossover** of data (e.g., `Child_One` does not have results for the `History_Set`).

*Expected Outcome: The Parent can view the distinct progress of each of their children correctly.* 

---

### Acceptance Criteria
- Every single step in the test script above must pass without any errors or unexpected behavior.
- Data access must be strictly limited based on the user's role and their relationship (Parent-Child) or assignment (`assignedTo`).
- A successful run of this entire script confirms that the core data model and security rules have been implemented correctly.