# ✍️ Penndora

Penndora is a web application designed to provide a platform for creative expression and community engagement. Built with Angular, Node.js, and Firebase, it allows users to register, create personalized profiles, post multimedia content, and engage in meaningful discussions through comments — all within a smooth Single Page Application (SPA) experience.

🔗 **Live Demo**: [https://penndora-6b0ec.web.app/](https://penndora-6b0ec.web.app/)

---

## 📚 Table of Contents

- [🚀 Features](#-features)
- [📦 Getting Started](#-getting-started)
  - [🔧 Prerequisites](#-prerequisites)
  - [🧪 Installation](#-installation)
  - [▶️ Development Server](#️-development-server)
  - [🔥 Firebase Configuration](#-firebase-configuration)
  - [🌐 Environment Setup](#-environment-setup)
- [🏗️ Code Scaffolding](#️-code-scaffolding)
- [📦 Build](#-build)
- [✅ Running Tests](#-running-tests)
- [🛠️ Tech Stack](#️-tech-stack)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🚀 Features

- **User Authentication**: Secure user login and registration using Firebase Authentication.
- **Profile Management**: Users can personalize and manage their own profiles.
- **Content Posting**: Create and share posts that include text, images, videos, and more.
- **Real-Time Commenting**: Engage in discussions with live comment updates.
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- **Progressive Web App**: Installable on devices with offline capabilities.

---

## 📦 Getting Started

### 🔧 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+)
- [Angular CLI](https://angular.io/cli) (v14+)
- [Firebase CLI](https://firebase.google.com/docs/cli) (for deployment)

### 🧪 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Amaanuddin05/Penndora.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Penndora
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

### ▶️ Development Server

To start the development server, run:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you make any changes to the source files.

### 🔥 Firebase Configuration

This project uses Firebase for authentication, database, and hosting. For security reasons, the Firebase configuration is not included in the repository. 

To set up Firebase for this project:

1. Create a file named `firebase.environment.ts` in the `src/environments/` directory
2. Add your Firebase configuration:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

3. Replace the placeholder values with your actual Firebase project credentials.

### 🌐 Environment Setup

The project uses environment files for configuration. For security, these files are not included in the repository. You'll need to create them:

1. Create `src/environments/environment.ts` for development:
```typescript
export const environment = {
  production: false,
  geminiApiUrl: 'YOUR_API_URL'
};
```

2. Create `src/environments/environment.prod.ts` for production:
```typescript
export const environment = {
  production: true,
  geminiApiUrl: 'YOUR_PRODUCTION_API_URL'
};
```

3. Create `src/environments/firebase.environment.ts` with your Firebase config (see above)

**Note:** All environment files are included in `.gitignore` to prevent exposing sensitive information.

---

## 🏗️ Code Scaffolding

To generate a new component, you can use:

```bash
ng generate component component-name
```

Similarly, you can generate directives, pipes, services, classes, guards, interfaces, enums, or modules using:

```bash
ng generate directive|pipe|service|class|guard|interface|enum|module
```

---

## 📦 Build

To build the project for production, run:

```bash
ng build --configuration=production
```

The build artifacts will be stored in the `dist/` directory.

To deploy to Firebase:

```bash
firebase deploy
```

---

## ✅ Running Tests

### Unit Tests

To execute the unit tests via [Karma](https://karma-runner.github.io), run:

```bash
ng test
```

### End-to-End Tests

To execute the end-to-end tests via a platform of your choice, run:

```bash
ng e2e
```

---

## 🛠️ Tech Stack

- **Frontend**: Angular 14+, HTML5, CSS3, TypeScript
- **Backend**: Node.js, Express.js
- **Authentication & Database**: Firebase Authentication, Firebase Realtime Database
- **Hosting**: Firebase Hosting
- **Version Control**: Git & GitHub
- **PWA Support**: Web App Manifest, Service Workers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. Make your changes and commit them:

   ```bash
   git commit -m 'Add some feature'
   ```

4. Push to the branch:

   ```bash
   git push origin feature/YourFeature
   ```

5. Open a pull request.

**Important**: When contributing, make sure to:
- Never commit environment files with real credentials
- Use the example environment files as templates
- Update documentation if you add new features

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ by [Amaanuddin05](https://github.com/Amaanuddin05)
