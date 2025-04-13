# [![Benkyo](https://benkyo.live/images/thumbnail1.png)](https://benkyo.live/)

#### [Website](https://benkyo.live) | [Documentation](#) | [Demo](#)

A simple and effective flashcard application that helps you learn anything faster.
Create your own flashcards or choose from pre-made decks. Study anytime, anywhere.

---

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](#) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](#)

[![Product showcase](https://benkyo.live/images/thumbnail1.png)](https://benkyo.live)

Create flashcards, study with spaced repetition, and chat with AI about your documents.

## Features

The Benkyo application supports:

-   💯 Free & open-source.
-   🧠 Advanced spaced repetition system (FSRS) for optimal learning.
-   🤖 AI-powered learning with document chat and quiz generation.
-   🌓 Dark/light theme support.
-   📱 Mobile-friendly responsive design.
-   🔄 Personalized learning algorithm that adapts to your performance.
-   📊 Track your learning progress with detailed statistics.
-   👥 Share decks with the community.
-   📄 Document upload and processing (PDF, DOC, DOCX).
-   🔐 OAuth login with Google and Facebook.
-   📊 Quiz generation and performance analysis.
-   🖼️ Support for various media types (text, images, audio, video).

## Tech Stack

### Frontend

-   React with TypeScript
-   Vite for fast development and building
-   TailwindCSS for styling
-   ShadcnUI components
-   React Query for data fetching
-   React Router for navigation

### Backend

-   Node.js with Express
-   TypeScript
-   MongoDB with Mongoose
-   JWT authentication
-   Passport.js for OAuth
-   Multer for file uploads

### AI and Vector Database

-   LangChain for document processing and RAG workflows
-   Google Generative AI (Gemini) for embeddings and chat
-   Pinecone vector database for document storage

## Quick Start

**Note:** These instructions are for setting up Benkyo for local development.

Use `npm` or `yarn` to install dependencies.

```bash
# Clone the repository
git clone https://github.com/yourusername/benkyo.git
cd benkyo

# Setup and start the backend
cd benkyo-server
npm install
cp .env.example .env  # Update with your values
npm run dev

# Setup and start the frontend (in a new terminal)
cd benkyo-client
npm install
cp .env.example .env  # Update with your values
npm run dev
```

Check out the [documentation](#) for more details!

## Environment Setup

### Backend (.env)

```
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URI=http://localhost:5173
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
GOOGLE_AI_KEY=your_google_ai_key
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_UPLOAD_PRESET_AVATAR=your_cloudinary_upload_preset
VITE_GOOGLE_AI_KEY=your_google_ai_key
```

## Docker Deployment

```bash
# Create .env file in the root directory with your values
docker-compose up -d
```

Access the application at `http://localhost:4000`

## Contributing

-   Missing something or found a bug? [Report here](#).
-   Want to contribute? Check out our [contribution guide](#) or let us know on [Discord](#).

## Project Structure

```
benkyo/
├── benkyo-client/         # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── ...
├── benkyo-server/         # Backend Node.js application
│   ├── src/               # Source code
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Mongoose schemas
│   │   ├── services/      # Business logic
│   │   └── ...
│   └── ...
└── ...
```

## Acknowledgments

-   [Free Sound Repetition System (FSRS)](https://github.com/open-spaced-repetition/fsrs4anki) for the spaced repetition algorithm
-   [Radix UI](https://www.radix-ui.com/) for accessible UI components
-   [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
-   [Google Generative AI](https://ai.google.dev/) for AI capabilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.
