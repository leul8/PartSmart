# PartSmart

PartSmart is a comprehensive platform for purchasing car parts and accessories. It allows users to search for car parts, validate part numbers, and browse products from various manufacturers. The platform also supports multilingual options, including English and Amharic. PartSmart leverages **CORS Proxy** to validate part numbers against RockAuto's data, integrates **Mapbox** for geographic location services, and uses **Gemini AI** to generate detailed product descriptions.

### Available Online:
You can access the platform online at [PartSmart.com.et](https://partsmart.com.et/).

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
