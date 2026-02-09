# FinanceAI Architecture Documentation

## System Overview

FinanceAI is an intelligent invoice processing system that automates the extraction of data from invoices (PDF/Image) and synchronizes them with Xero as draft invoices. The system consists of a React frontend and a Node.js backend API.

### High-Level Workflow
1.  **Upload**: Client uploads an invoice via the Client Portal.
2.  **Processing**: Backend receives the file and initiates an AI extraction pipeline.
3.  **Extraction**: Google Gemini (via OpenRouter) extracts vendor, date, total, and line items.
4.  **Classification**: AI determines the appropriate Chart of Accounts code for each line item.
5.  **Sync**: A draft invoice is created in Xero with the extracted data and the original file attached.
6.  **Review**: Finance team reviews the draft in the Internal Dashboard or directly in Xero.

---

## Backend Architecture (`/server`)

The backend is a Node.js Express application that serves as the API gateway and orchestration layer.

### Key Services

#### 1. AI Service (`server/services/aiService.js`)
*   **Purpose**: Handles all interactions with Large Language Models (LLMs).
*   **Models**: Configurable via `.env` (Default: `google/gemini-2.0-flash-001`).
*   **Agents**:
    *   **Extractor Agent**: Parses the raw text from the invoice PDF/Image to JSON.
    *   **Classifier Agent**: Maps line item descriptions to Xero Account Codes (e.g., "Office Supplies" -> `420`).
*   **Retry Logic**: Implements retry mechanisms with fallback models if the primary LLM fails or is rate-limited.

#### 2. Xero Service (`server/services/xeroService.js`)
*   **Purpose**: Manages authentication and data synchronization with the Xero API.
*   **Authentication**: Uses **Client Credentials Flow** for server-to-server communication. This allows the backend to act on behalf of the application without requiring a specific user to be logged in interactively for background tasks.
*   **Token Management**: Automatically handles access token retrieval.

#### 3. Progress Service (`server/services/progressService.js`)
*   **Purpose**: Tracks the state of long-running invoice processing tasks.
*   **Storage**: Uses an in-memory store for active requests and optionally syncs to **Supabase** (PostgreSQL) for persistence if configured.
*   **Real-time Logs**: Stores granular logs (e.g., "Extracting data...", "Classifying items...") which are polled by the frontend.

### API Routes (`server/index.js`)
*   `POST /api/upload`: Receives file uploads and triggers background processing.
*   `GET /api/processing/:id`: Returns the current status and logs for a specific request.
*   `GET /api/xero/invoices`: Fetches recent draft invoices from Xero.
*   `GET /api/xero/accounts`: Fetches the Chart of Accounts for the classification agent.

---

## Frontend Architecture (`/src`)

The frontend is a Single Page Application (SPA) built with **React**, **Vite**, and **Tailwind CSS**.

### Key Features

#### 1. Client Portal (`src/features/client`)
*   **File Upload**: Supports drag-and-drop for PDFs and Images.
*   **Status Tracking**: Real-time progress bars and log display for uploaded files.
*   **Recent Documents**: Lists recently created draft invoices, fetched directly from Xero.
*   **Bulk Upload**: Interface for uploading multiple invoices simultaneously.

#### 2. Internal Dashboard (`src/features/internal`)
*   **Metrics**: Displays key financial metrics (Revenue, Expenses, Net Profit) based on Xero data.
*   **Review Queue**: (Planned) Interface for approving or modifying draft invoices before they are authorized in Xero.

### UI Components
*   **Library**: Custom components built with `lucide-react` icons.
*   **Styling**: styled using Tailwind CSS for a responsive and modern design.

---

## Data Flow: Invoice Processing

1.  **Client** sends `POST /api/upload` with `file`.
2.  **Server** saves file to `uploads/` directory.
3.  **Server** creates a `requestId` in `ProgressService` (Status: `pending`).
4.  **Server** returns `requestId` immediately to Client.
5.  **Background Process**:
    *   **Text Extraction**: `pdf-parse` extracts raw text.
    *   **LLM Extraction**: `aiService.extractInvoiceData(text)` returns JSON.
    *   **Account Mapping**: `aiService.determineAccountCode(items)` adds account codes.
    *   **Xero Sync**: `xeroService.createInvoice(data)` creates draft in Xero.
    *   **Attachment**: `xeroService.uploadAttachment(invoiceId, file)` uploads the file.
    *   **Completion**: Status updated to `completed`.
6.  **Client** polls `/api/processing/:requestId` to show logs and final success message.

---

## Configuration (`.env`)

The application is configured via environment variables.

| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (Default: 3156) |
| `XERO_CLIENT_ID` | Xero App Client ID |
| `XERO_CLIENT_SECRET` | Xero App Client Secret |
| `OPENROUTER_API_KEY` | Key for LLM access |
| `AI_MODEL_DEFAULT` | Default LLM Model |
| `AI_MODEL_EXTRACTOR` | Model for Extraction Agent |
| `AI_MODEL_CLASSIFIER` | Model for Classification Agent |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (Optional) |
| `SUPABASE_SERVICE_KEY` | Supabase Key (Optional) |

---

## Database (Supabase)

While the application primarily relies on Xero as the source of truth for financial data, Supabase is used for:
*   **Processing Logs**: Persisting the audit trail of AI actions.
*   **Request History**: Tracking all uploaded files and their final statuses.
*   **Authentication**: (If enabled) Managing user access to the Internal Dashboard.
