# Plaine - Simplifying Your Health Journey

Plaine is your all-in-one AI health companion, revolutionizing personal healthcare. Provides health status updates, personalized recommendations, and potential health issues based on your interactions with the application. With Plaine, you can instantly communicate with AI for medical advice, understand complex medicine details and medical reports, and create tailored health plans. By integrating cutting-edge AI into every aspect, Plaine offers 24/7 access to personalized healthcare insights, making it easier than ever to take control of your well-being and make informed health decisions.

## Table of Contents
- [Getting Started](#getting-started)
- [Build With](#built-with)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Getting Started
These instructions will guide you on how to set up and run Plaine locally for development and testing purposes. To get a local copy up and running follow these simple steps.

### Prerequisites
To run NextJS App, you will need:
- NodeJS
- NPM

### Installation
1. Clone the repository
2. Install dependencies:
    ```bash
        npm install
    ```
2. Start a development server:
    ```bash
        npm run dev
    ```

### Configuration
Before running the application, You will need to:

1. Create `.env` files. Below is an example of what the `.env` file might look like:

   ```plaintext
    MONGO_URI=YOUR_MONGO_URI
    DB_NAME=YOUR_MONGO_DB_NAME

    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

    GCS_PROJECT_ID=YOUR_GOOGLE_CLOUD_STORAGE_PROJECT_ID
    GCS_CLIENT_EMAIL=YOUR_GOOGLE_CLOUD_STORAGE_CLIENT_EMAIL
    GCS_PRIVATE_KEY=YOUR_GOOGLE_CLOUD_STORAGE_PRIVATE_KEY
    GCS_BUCKET_NAME=YOUR_GOOGLE_CLOUD_STORAGE_BUCKET_NAME

    AUTH_SECRET=YOUR_NEXT_AUTH_SECRET
    AUTH_URL=YOUR_NEXT_AUTH_URL

    PINECONE_API_KEY=YOUR_PINCONE_API_KEY
    PINECONE_INDEX_NAME=YOUR_PINCONE_INDEX_NAME
   ```

## Built With
- **Framework**: NextJS
- **APIs**: Gemini API, Google Places API, Maps Javascript API, Google Cloud Storage API, Pinecone API
- **Database**: MongoDB
- **Authentication**: Next Auth

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes.
4. Push your branch: `git push origin feature-name`.
5. Create a pull request.

### Main Author

- **Donny Kurniawan** - _Initial work_ - [donnykurniawan3707@gmail.com](mailto:donnykurniawan3707@gmail.com)

## Acknowledgments

- Thanks to all the developers and contributors who made this project possible.
- Special thanks to Google for providing the APIs that power our application.

## License

This project is licensed under the MIT License - see the LICENSE file for more details.
