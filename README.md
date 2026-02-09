# FinanceAI - Intelligent Invoice Processing & Client Portal

FinanceAI is a modern web application designed to streamline invoice management and financial operations. It features an AI-powered invoice processing system that extracts data from uploaded invoices, classifies them, and automatically creates draft invoices in Xero. The application includes a client portal for document uploads and an internal dashboard for review and approval.

## Features

*   **AI Invoice Extraction**: Uses advanced LLMs (Google Gemini 2.0 Flash) to extract invoice details (Vendor, Date, Total, Items) from PDF and Image files.
*   **Intelligent Classification**: Automatically determines the correct Chart of Accounts code for line items based on descriptions and vendor names.
*   **Xero Integration**: Seamlessly syncs with Xero to create draft invoices and upload attachments.
*   **Client Portal**: Secure interface for clients to upload invoices and view real-time processing status.
*   **Internal Dashboard**: Allows finance teams to review, approve, or edit draft invoices before they are finalized in Xero.
*   **Real-time Feedback**: WebSocket/Polling-based logging system provides immediate feedback on the AI processing steps.

## Prerequisites

*   **Node.js**: Version 18 or higher.
*   **NPM**: Installed with Node.js.
*   **Xero Account**: A Xero developer app is required for API credentials.
*   **OpenRouter API Key**: For accessing LLM models (Google Gemini, etc.).
*   **Supabase Account**: For database and authentication (optional but recommended for persistence).

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd financeai
    ```

2.  **Install Dependencies**:
    The project uses a unified package structure. Install dependencies from the root directory:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the root directory with the following variables.

**Note**: Never commit your actual API keys to version control.

```env
# --- Server Configuration ---
PORT=3156 (Default)

# --- Xero Integration ---
# Create an app at https://developer.xero.com/ to get these credentials.
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret

# --- AI & LLM Configuration ---
# Get an API Key from https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key

# Configure the models to use (Defaults to google/gemini-2.0-flash-001 if not set)
AI_MODEL_DEFAULT=google/gemini-2.0-flash-001
AI_MODEL_EXTRACTOR=google/gemini-2.0-flash-001
AI_MODEL_CLASSIFIER=google/gemini-2.0-flash-001

# --- Supabase Configuration ---
# Required for database persistence and auth
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# --- Optional Integrations ---
VITE_N8N_WEBHOOK_URL=optional_n8n_webhook_url
N8N_CHAT_WEBHOOK_URL=optional_n8n_chat_url
```

## Running the Application

We have provided a convenience script to start both the backend and frontend simultaneously.

### Using the Startup Script (Recommended)

Run the following command in your terminal:

```bash
./start-app.sh
```

Or via NPM:

```bash
npm start
```

This will launch:
1.  **Backend Server** on port `3156`.
2.  **Frontend (Vite)** at `http://localhost:5173`.

### Stopping the Application

To stop the services, simply press `CTRL+C` in the terminal window where you ran the start script.

If you ran the services in the background or need to force stop them, use the dedicated stop script:

```bash
./stop-app.sh
```
or via NPM:
```bash
npm stop
```

---

### Manual Startup (Alternative)

If you prefer to run services separately:

1.  **Start Backend**:
    ```bash
    node server/index.js
    ```
2.  **Start Frontend**:
    ```bash
    npm run dev
    ```

## Architecture & Services

For a detailed breakdown of the system architecture, components, and data flow, please refer to the [Architecture Documentation](docs/ARCHITECTURE.md).

*   **`src/`**: React Frontend.
    *   `features/client`: Client Portal components (Upload, Recent Invoices).
    *   `features/internal`: Internal Dashboard components (Review Queue, Metrics).
*   **`server/`**: Node.js Backend.
    *   `index.js`: Main entry point and API routes.
    *   `services/aiService.js`: Handles interactions with OpenRouter/Gemini for extraction and classification.
    *   `services/xeroService.js`: Manages Xero API authentication and data sync.
    *   `services/progressService.js`: Tracks the status of background processing tasks.

## Troubleshooting

*   **"Invalid Date"**: Ensure the backend is returning the standard `date` field from Xero. The frontend expects an ISO date string.
*   **AI Extraction Errors**: Check your `OPENROUTER_API_KEY` and ensure you have credits. You can inspect server logs for raw AI responses.
*   **Xero Connection**: Verify your `XERO_CLIENT_ID` and `SECRET`. Access tokens are managed via Client Credentials flow for the backend service.
