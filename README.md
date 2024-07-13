
# Whatsapp Number Checker

## Overview

WhatsApp Number Checker is a web-based application designed to streamline the process of verifying mobile numbers against a simulated WhatsApp service. The core functionality of this system revolves around the ability to validate whether mobile numbers listed within uploaded files (e.g., CSV or Excel) are registered on WhatsApp, categorizing them as either valid or invalid based on a mock validation rule. This functionality supports both individual and bulk uploads, allowing for efficient asynchronous processing.

## Key Functionalities

1.	Admin Features:
* WhatsApp Authentication: Admins can log in to WhatsApp using a QR code to link the application directly to WhatsApp services.
* Analytics Dashboard: Provides comprehensive analytics, enabling admins to monitor system activity and validate operations in real time.

2.	User Features:
* File Upload: Users can upload files containing mobile numbers, names, and email addresses. The system supports various file formats including CSV and Excel.
* Validation Process: Each mobile number is checked against a mock service to determine its registration with WhatsApp. A number is marked as valid if it is exactly 10 digits long, otherwise, it is marked as invalid. The results are recorded in the system accordingly.
* Bulk Upload and Asynchronous Processing: The application supports the uploading of multiple files at once and processes these files asynchronously to optimize performance.
* User Analytics: Users can access analytics related to their uploads, such as the number of valid and invalid numbers processed.


## Technologies Used

* React.js: Frontend user interface.
* Node.js/Express: Backend server.
* MongoDB/Mongoose: Database for storing user/admin and upload data.
* Socket.IO: Real-time communication.
* JWT (JSON Web Tokens): Authentication tokens for users.
* Material-UI: Frontend UI library.
* Multer: Middleware for handling file uploads.
* Axios: For HTTP requests.
* PapaParse, xlsx: Parsing CSV and Excel files.
* Chart.js: Displaying upload statistics.

## Setup and Installation
1. **Environment Setup:**
   * Clone the repository and navigate to the project directory.
   * Install dependencies in root directory and backend directory.

        ```bash
        # Install dependencies in the root directory
        npm install
        # Navigate to the backend directory
        cd backend
        # Install dependencies in the backend directory
        npm install
        ```

2. **Environment Variables**:
* Set up .env file with variables like PORT, MONGODB_URI, and JWT_SECRET. 
* Note: Sample .env file is already provided in the backend directory, to test run the application you do not need to make any changes to it.

3. **Starting the Server**:
* Navigate to backend directory and start the server.

    ```bash
    # Navigate to backend directory
    cd backend
    #start the server
    node server.js
    ```
4. **Starting the Client**:
* Navigate to root directory and start the client.

    ```bash
    # In the project root directory
    npm start
    ```
5. **User and Admin Registration**:
* When you run the application locally, no users or admins are pre-registered. You can register a user and an admin using the following curl commands in the terminal:
* Note: Make sure your server.js is running when you execute these commands.

**Register a User**:

      
    curl -X POST http://localhost:5500/auth/user/register -H "Content-Type: application/json" -d '{"email": "user@example.com", "password": "yourpassword"}'

**Register an Admin**:

    curl -X POST http://localhost:5500/auth/register -H "Content-Type: application/json" -d '{"username": "adminUsername", "password": "adminPassword"}'  
## Components
 **Frontend Components**
* Login and UserLogin: Components for handling admin and user login functionalities.
* AdminPage and UsersPage: Dashboard pages for admin and regular users.
* FileValidator: Manages file uploads and validation processes.
* AdminAnalytics: Displays statistics and charts related to file uploads.

**Backend Components**
* authRoutes: Routes for handling authentication and user management.
* authMiddleware: Middleware for token verification and user authentication.
* server.js: Main server setup, including routes, database connection, and socket events.

## API Endpoints
**Authentication Endpoints**
- **POST /auth/register**: Registers a new admin. Accepts username and password in the JSON body.
- **POST /auth/login**: Admin login. Requires admin username and password.
- **POST /auth/user/register**: Registers a new user. Requires email and password in the JSON body.
- **POST /auth/user/login**: User login. Requires user email and password.

**Upload and Processing Endpoints**
- **POST /upload**: Handles file uploads and processes data. This endpoint is protected and requires authentication. Supports uploading multiple files in CSV or Excel formats.

**Admin-Specific Endpoints**
- **GET /api/admin/upload-stats**: Provides aggregated statistics about file uploads, such as total numbers processed, valid, and invalid numbers.
- **GET /api/admin/uploads-over-time**: Returns data about uploads over time, helping admins track activity and validate numbers on specific dates.
- **GET /api/admin/upload-events**: Fetches all upload events, providing a detailed log of upload activity by all users.

**Real-Time WhatsApp Integration**
- **WebSocket /qr**: Emits QR codes for WhatsApp authentication. Listens for `qr` event and sends QR code data URL to clients.
- **WebSocket /authenticated**: Notifies clients when the WhatsApp client is authenticated successfully.
- **WebSocket /qr-request**: Requests re-authentication via QR code when the WhatsApp client disconnects.

**Utility and Testing Endpoints**
- **GET /some-route**: A simple test endpoint to ensure the server is handling requests correctly.

**Additional Routes and Middleware**
- All routes under `/auth` utilize the `authMiddleware` for JWT token verification ensuring that requests are authenticated. The `protect` middleware specifically checks for valid tokens before allowing access to sensitive endpoints.

## Database Schemas
* Admin: Stores admin credentials and information.
* UserAuth: Stores user credentials and information.
* UploadData: Stores details from uploaded CSV or Excel files.
* UploadEvent: Logs file upload details, including file names, sizes, and counts of valid/invalid numbers.

## Security Features
* JWT Authentication: Ensures that endpoints require a valid token for access.
* Password Hashing: Uses bcrypt to securely store user passwords.
* CORS: Restricts cross-origin requests to trusted domains.

## Real-Time Features
* WhatsApp Integration: Uses Socket.IO to handle real-time WhatsApp QR code generation and session management.
* Real-time Upload Feedback: Provides live feedback on the status of file uploads.

## Known Issues and Workarounds

As with any software application, there may be unresolved issues that users may encounter during usage. Below are some known issues within the WhatsApp Number Checker application and recommended actions to mitigate these problems:

1. **Delayed QR Code Generation**:
   - **Issue**: The QR code for WhatsApp authentication can take about 10-15 seconds to load sometimes.
   - **Impact**: Users may experience a delay when attempting to log in using WhatsApp.
   - **Workaround**: Please allow up to 15 seconds for the QR code to appear. If it takes longer, refresh the page and try again.

2. **Session Timeout Handling**:
   - **Issue**: If the user page is left idle for an extended period, subsequent file upload attempts may fail.
   - **Impact**: Users need to re-authenticate to restore session activity.
   - **Workaround**: If your upload does not process after being idle, please log out and then log back in to reset your session.

