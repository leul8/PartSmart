# PartSmart

PartSmart is a comprehensive platform for purchasing car parts and accessories. It allows users to search for car parts, validate part numbers, and browse products from various manufacturers. The platform also supports multilingual options, including English and Amharic. PartSmart leverages **CORS Proxy** to validate part numbers against RockAuto's data, integrates **Mapbox** for geographic location services, and uses **Gemini AI** to generate detailed product descriptions.

### Available Online:
You can access the platform online at [partsmart.com.et](https://partsmart.com.et/).

## Features

- **Multilingual Support**: Switch between English and Amharic to cater to a wider audience.
- **Part Number Validation**: Validates part numbers using a CORS proxy server that interacts with the RockAuto website.
- **Car Models & Manufacturers**: Fetches car models and manufacturers from RockAuto data through the CORS proxy server.
- **AI Product Descriptions**: Utilizes Gemini AI to generate detailed product descriptions based on part numbers.
- **Map Integration**: Integrates with Mapbox for showing geographic data, such as store locations and delivery options.

## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **Firebase**: User authentication and backend services.
- **Redux**: State management for handling app-level state.
- **i18next**: Internationalization for language support (English and Amharic).
- **Mapbox**: Geolocation and interactive maps.
- **Gemini AI**: AI-powered generation of product descriptions.
- **CORS Proxy**: Proxy service to access RockAuto’s data for part validation and fetching car models and manufacturers.

## Installation

To run this project locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/partsmart.git
cd partsmart
2. Install dependencies
Install the required dependencies using npm:

npm install
3. Firebase Setup (Optional)
If you wish to enable Firebase Authentication, follow these steps:

Go to the Firebase Console.

Create a new Firebase project.

Enable Firebase Authentication for your desired login methods (email/password, Google, etc.).

Add your Firebase configuration to a .env file in the root of your project:

REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

4. Set Up Mapbox (Optional)
If you'd like to include Mapbox's geolocation functionality:

Create an account on Mapbox.

Get your Mapbox Access Token from the dashboard.

Add your Mapbox token to the .env file:

Copy
REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-token
5. Set Up CORS Proxy for RockAuto Integration
Since RockAuto does not provide a public API, this project uses a CORS Proxy to interact with RockAuto’s website and retrieve part validation, car models, and manufacturers data.

We will use a third-party CORS proxy service to make requests to RockAuto's website and bypass CORS restrictions.

Example CORS Proxy URL: https://cors-anywhere.herokuapp.com/

Add the CORS proxy URL to the .env file of your React project:

env
Always show details

Copy
REACT_APP_CORS_PROXY_URL=https://cors-anywhere.herokuapp.com/
You can choose other CORS proxy services, but be aware of usage limits. Make sure to check the CORS proxy documentation for rate limits and more details.

6. Using the CORS Proxy in Your Application
The application will use the CORS proxy to send requests to RockAuto's website for part number validation and retrieving car models and manufacturers.

Here is an example of how the proxy might be used in your React app:

javascript
Always show details

Copy
const proxyUrl = process.env.REACT_APP_CORS_PROXY_URL;
const rockAutoUrl = "https://www.rockauto.com/en/catalog/";

const validatePartNumber = async (partNumber) => {
  const response = await fetch(`${proxyUrl}${rockAutoUrl}${partNumber}`);
  const data = await response.text();

  // Process the response from RockAuto and validate the part
  // Use the data to extract details such as part validity, description, etc.
};
7. Start the Development Server
Once everything is set up, start the development server for your React app:

bash
Always show details

Copy
npm start
Visit http://localhost:3000 to view the app in your browser.

Usage
Language Toggle: Switch between English and Amharic using the language button on the top right corner of the navbar.

Part Number Validation: Use the search bar to enter a part number and validate it via the CORS proxy server, which interacts with RockAuto’s website. Relevant car parts will be displayed.

Car Models and Manufacturers: Search for car parts by selecting car models and manufacturers retrieved from RockAuto data via the CORS proxy.

AI-Generated Descriptions: View detailed, AI-generated descriptions of products based on part numbers, using Gemini AI.

Mapbox Integration: The Mapbox map integration allows you to view geographic locations such as stores, warehouses, or delivery zones.

Screenshots
Desktop View

Mobile View

Contributing
We welcome contributions to the PartSmart project! If you'd like to contribute, please follow these steps:

Fork the repository.

Create a new branch (git checkout -b feature-name).

Make your changes.

Commit your changes (git commit -am 'Add new feature').

Push to the branch (git push origin feature-name).

Open a pull request.

Please ensure that your changes do not break existing functionality and that tests are added for new features.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Thank you for checking out PartSmart! If you have any questions, feel free to reach out to us or open an issue in the repository. """
