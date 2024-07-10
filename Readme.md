# Noting Backend

This repository contains the backend for the Noting application, a full-stack MERN application. The backend is built using Node.js, Express, and MongoDB. It handles user authentication, note management, label management, and collaborator management.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Notes](#notes)
  - [Labels](#labels)
  - [Collaborators](#collaborators)
- [Models](#models)
- [Middlewares](#middlewares)
- [Controllers](#controllers)
- [Utils](#utils)
- [Validations](#validations)
- [Error Handling](#error-handling)
- [License](#license)

## Features

- User registration and authentication using JWT
- Google OAuth login
- CRUD operations for notes
- Add, delete, and fetch labels
- Add and remove collaborators for notes
- Upload images for notes using Multer

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js
- MongoDB

### Installation

1. Clone the repository:

```sh
git clone https://github.com/Esha-Sharmaa/noting-backend.git
cd noting-backend
```

2. Install dependencies:

```sh
npm install
```

3. Set up environment variables. Create a `.env` file in the root directory and add the following:

```env
MONGO_URI=
ACCESS_TOKEN_SECRET_KEY=
REFRESH_TOKEN_SECRET_KEY=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_EXPIRY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGIN=*
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET="
```

4. Start the development server:

```sh
npm run start
```

The server will be running on `http://localhost:5000`.

## API Endpoints

### Authentication

- `POST /api/v1/users/register`: Register a new user
- `POST /api/v1/users/login`: Login a user
- `POST /api/v1/users/logout`: Logout a user
- `POST /api/v1/users/refresh-token`: Refresh access token
- `GET /api/v1/users/profile`: Get user profile
- `GET /api/v1/auth/google`: Google login
- `GET /api/v1/auth/google/callback`: Google login callback

### Notes

- `GET /api/v1/notes`: Get all notes
- `GET /api/v1/notes/collab`: Get all collaborative notes
- `GET /api/v1/notes/:id`: Get a single note
- `POST /api/v1/notes/add`: Add a new note
- `PUT /api/v1/notes/edit/:id`: Edit a note
- `DELETE /api/v1/notes/delete/:id`: Delete a note
- `PUT /api/v1/notes/labels/add`: Add a label to a note
- `DELETE /api/v1/notes/labels/delete/:labelId/:noteId`: Remove a label from a note
- `GET /api/v1/notes/archive/:id`: Archive a note
- `GET /api/v1/notes/unarchive/:id`: Unarchive a note
- `GET /api/v1/notes/trash/:id`: Trash a note
- `GET /api/v1/notes/restore-trash/:id`: Restore a trashed note

### Labels

- `GET /api/v1/labels`: Fetch all labels
- `POST /api/v1/labels/create-label`: Create a new label
- `DELETE /api/v1/labels/delete-label/:id`: Delete a label

### Collaborators

- `POST /api/v1/collaborators/add`: Add a collaborator
- `DELETE /api/v1/collaborators/delete/:id`: Remove a collaborator

## Models

- **User**: Stores user information and authentication details.
- **Note**: Stores note details, including title, content, image URL, labels, collaborators, and status flags.
- **Label**: Stores label information.
- **Collaborator**: Stores collaborator details for notes.

## Middlewares

- **auth.middleware.js**: Middleware to verify JWT.
- **multer.middleware.js**: Middleware to handle file uploads using Multer.

## Controllers

- **user.controller.js**: Handles user registration, login, logout, profile retrieval, and token refresh.
- **auth.controller.js**: Handles Google OAuth login.
- **note.controller.js**: Handles CRUD operations for notes, as well as archiving, trashing, and restoring notes.
- **label.controller.js**: Handles CRUD operations for labels.
- **collaborator.controller.js**: Handles adding and removing collaborators.

## Utils

- **passport.js**: Configures Google OAuth strategy for Passport.
- **ApiResponse.js**: Class for standardized API responses.
- **ApiError.js**: Class for standardized API error handling.
- **cloudinary.js**: Contains functions for cloudinary upload.
- **generateAccessAndRefreshToken.js**: Function to generate access and refresh tokens

## Validations

- **validateRegisterUser.js**: Validation for user registration.
- **validateLabelName.js**: Validation for label creation.
- **validateAddCollaborator.js**: Validation for adding a collaborator.

## Error Handling

Errors are handled using the `ApiError` class, which standardizes the structure of error responses.
