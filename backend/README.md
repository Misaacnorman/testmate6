# Backend Application

This directory contains the backend code for the application, which is built using Node.js and Express.

## Setup Instructions

1. **Install Dependencies**: 
   Navigate to the `backend` directory and run:
   ```
   npm install
   ```

2. **Environment Variables**: 
   Create a `.env` file in the `backend` directory to store environment variables such as database connection strings and API keys.

3. **Run the Application**: 
   Start the server by running:
   ```
   npm start
   ```

4. **API Endpoints**: 
   The backend exposes various API endpoints for the frontend to interact with. Refer to the code in `src/app.js` for the list of available routes.

## Database

The backend connects to a database. Ensure that the database is set up and running before starting the application. Configuration details can be found in `src/db/index.js`.

## Testing

To run tests, use:
```
npm test
```

## Contribution

Feel free to fork the repository and submit pull requests for any improvements or bug fixes.