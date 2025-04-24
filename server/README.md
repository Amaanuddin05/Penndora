# Gemini API Server

Simple Express server that provides an API endpoint to interact with Google's Gemini AI model.

## Deployment on Render

1. Sign up for a [Render](https://render.com) account
2. Go to your Render Dashboard and click **New** > **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - Name: gemini-api (or your preferred name)
   - Root Directory: server
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add your environment variables:
   - GEMINI_API_KEY: (Get this from [Google AI Studio](https://makersuite.google.com/app/apikey))
6. Click **Create Web Service**

## Local Development

1. Clone the repository
2. Navigate to the server directory
3. Create a `.env` file based on `.env.example`
4. Install dependencies: `npm install`
5. Start the development server: `npm run dev`

## API Endpoints

- `GET /` - Health check
- `POST /api/gemini` - Send prompts to Gemini API
  
  Request body:
  ```json
  {
    "prompt": "Your prompt here"
  }
  ```

  Response:
  ```json
  {
    "reply": "AI-generated response"
  }
  ``` 