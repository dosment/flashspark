# FlashSpark

This is a Next.js application for creating and taking educational quizzes, with AI-powered features for content generation.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A Firebase project

### 1. Set Up Firebase

This project requires a Firebase project to handle user authentication and database storage.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your project, create a new **Web App** to get your client-side Firebase configuration keys.
3.  **Enable Firestore:** Go to the Firestore Database section and create a database in production mode.
4.  **Enable Google Authentication:** Go to the Authentication section, click the "Sign-in method" tab, and enable the **Google** provider.

### 2. Set Up Service Account

The application's backend requires a Firebase service account to perform administrative actions, like creating new user accounts.

1.  In your Firebase project settings, go to the **Service accounts** tab.
2.  Click **Generate new private key** to download a JSON file with your service account credentials.
3.  **Important:** Rename this downloaded file to `firebase-service-account.json`.
4.  Move this file into the `src/lib/` directory of the project.

**NOTE:** The `firebase-service-account.json` file is listed in `.gitignore` and **should never be committed to your repository**. It contains sensitive private keys.

### 3. Configure Firebase in the App

1.  Open `src/lib/firebase.ts`.
2.  Replace the placeholder `firebaseConfig` object with the configuration object for the Web App you created in Step 1.

### 4. Install Dependencies and Run

```bash
npm install
npm run dev
```

The application will be running at `http://localhost:9002`.
