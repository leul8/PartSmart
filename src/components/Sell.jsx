import React, { useState, useEffect } from 'react';
import { auth, db } from './Firebase';
import {  collection, addDoc, doc, getDoc } from 'firebase/firestore';
import mapboxgl from 'mapbox-gl'; 
import { GoogleGenAI } from "@google/genai";
import geminiIcon from '../assets/google-gemini-icon.png';
import mapIcon from '../assets/map.png'; 
import imageCompression from 'browser-image-compression';
import { useTranslation } from "react-i18next";

const CLOUD_NAME = '';
const API_KEY = ''; 
const API_SECRET = '';

function Sell() {
  const [title, setTitle] = useState("");         
  const [description, setDescription] = useState("");  
  const [price, setPrice] = useState("");           
  const [quantity, setQuantity] = useState(1);       
  const [category, setCategory] = useState("");     
  const [condition, setCondition] = useState("new"); 
  const [images, setImages] = useState([]);         
  const [uploadProgress, setUploadProgress] = useState([]); 
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState("Addis Ababa");
  const [map, setMap] = useState(null);
  const [showMap, setShowMap] = useState(false); 
  const [showModal, setShowModal] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false);
  const [partNumber, setPartNumber] = useState(""); 
  const [carModel, setCarModel] = useState(""); 
  const [carYear, setCarYear] = useState("");
  const [carManufacturer, setCarManufacturer] = useState(""); 
  const [carManufacturers, setCarManufacturers] = useState([]); 
  const [carModels, setCarModels] = useState([]); 
  const [subCategory, setSubCategory] = useState("");
  const [carPartsType, setCarPartsType] = useState("");
  const [isValidPartNumber, setIsValidPartNumber] = useState(null);
  const [checkingPartNumber, setCheckingPartNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleImageUpload = (e) => {
    setImages([...images, ...e.target.files]);
  };

const uploadImagesToCloudinary = async (imageFiles) => {
  const uploadedImageUrls = [];
  const progressArray = new Array(imageFiles.length).fill(0);
  setUploadProgress(progressArray);
  setIsUploading(true);

  const compressionOptions = {
    maxSizeMB: 1, 
    maxWidthOrHeight: 1024, 
    useWebWorker: true,
  };

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];

    try {
      const compressedFile = await imageCompression(file, compressionOptions);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', 'leul88');
      formData.append('api_key', API_KEY);
      formData.append('timestamp', Date.now() / 1000);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error('Cloudinary upload failed');
      }

      uploadedImageUrls.push(data.secure_url);
      progressArray[i] = 100;
      setUploadProgress([...progressArray]);

    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      progressArray[i] = -1;
      setUploadProgress([...progressArray]);
      throw error;
    }
  }

  setIsUploading(false);
  return uploadedImageUrls;
};


 
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title || !description || !price || !category || !images.length) {
    console.error("Missing required fields!");
    setShowModal(true);
    setIsSuccess(false);
    return;
  }

  if (category === "car_parts" && (!partNumber || !carModel || !carYear || !carManufacturer)) {
    console.error("Missing car_parts fields!");
    setShowModal(true);
    setIsSuccess(false);
    return;
  }

  if (category === "accessories" && !subCategory) {
    console.error("Missing subCategory for accessories!");
    setShowModal(true);
    setIsSuccess(false);
    return;
  }

  setShowModal(true);
  setIsSuccess(false);

  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      setShowModal(false);
      return;
    }

    console.log("User authenticated:", user.uid);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User data not found.");
      setShowModal(false);
      return;
    }

    const { username, uid } = userSnap.data();
    console.log("User data fetched:", { username, uid });

    console.log("Uploading images...");
    const uploadedImageUrls = await uploadImagesToCloudinary(images);
    
    if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
      console.error("Image upload failed.");
      setShowModal(false);
      return;
    }

    console.log("Images uploaded successfully:", uploadedImageUrls);

    const formData = {
      title,
      description,
      price,
      quantity,
      category,
      condition,
      location,
      images: uploadedImageUrls,
      username,
      uid,
      createdAt: new Date(),
      ...(category === "car_parts" && { partNumber, carModel, carYear, carManufacturer, carPartsType }),
      ...(category === "accessories" && { subCategory }),
    };
    
    console.log("Car Parts Type:", carPartsType);

    console.log("Saving to Firestore...");
    await addDoc(collection(db, "Products"), formData);
    
    console.log("Saved to Firestore successfully!");
    setIsSuccess(true);

    setTimeout(() => {
      setShowModal(false);
    }, 2000);
  } catch (error) {
    console.error("Error during submission:", error);
    setIsSuccess(false);
    setTimeout(() => {
      setShowModal(false);
    }, 2000);
  }
};



  const reverseGeocode = async (lat, lng) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoibGV1bDgiLCJhIjoiY204cms4dGtlMDBrcDJrczJlZXZ5eXp1OCJ9.uPt4tFg5fUYQIVKgo7iRMQ`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return "Unknown Location";
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return "Unknown Location";
    }
  };

  const initializeMap = () => {
    if (map) {
      map.remove();
    }

    mapboxgl.accessToken = '';

    const mapInstance = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [38.7577, 9.145],
      zoom: 12,
      interactive: true, 
    });

    mapInstance.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      const address = await reverseGeocode(lat, lng);

      setLocation(address);
    });

    new mapboxgl.Marker().setLngLat([38.7577, 9.145]).addTo(mapInstance);

    mapInstance.addControl(new mapboxgl.NavigationControl());

    setMap(mapInstance);
  };

  useEffect(() => {
    if (showMap) {
      initializeMap();
    }
  }, [showMap]);

  async function fetchManufacturers() {
    const url = 'https://car-api2.p.rapidapi.com/api/makes?direction=asc&sort=id';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '',
        'x-rapidapi-host': 'car-api2.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const carNames = data.data.map(item => item.name);
      setCarManufacturers(carNames);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    }
  }

  async function fetchCarModels(manufacturer) {
    if (!manufacturer) return;
    const url = `https://car-api2.p.rapidapi.com/api/models?make=${manufacturer}&sort=id&direction=asc&year=2020&verbose=yes`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '',
        'x-rapidapi-host': 'car-api2.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const models = data.data.map(item => item.name);
      setCarModels(models);
    } catch (error) {
      console.error('Error fetching car models:', error);
    }
  }

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const generateCarYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1900; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };
  const validatePartNumber = async (partNum) => {
    setCheckingPartNumber(true);
  
    if (!partNum || typeof partNum !== 'string' || partNum.length < 4 || partNum.length > 20) {
      setIsValidPartNumber(false);
      setCheckingPartNumber(false);
      return;
    }
  
    try {
      const response = await fetch(
        `https://corsproxy.io/?https://www.rockauto.com/en/partsearch/?partnum=${encodeURIComponent(partNum)}`
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
  
      const html = await response.text();
  
      console.log(html);
  
      const isValid = 
        html.includes('class="listing-final-manufacturer"') || 
        html.includes('class="listing-description"') || 
        !html.includes('<span class="navlabellink nvoffset nnormal">No Parts Found</span>');
  
      setIsValidPartNumber(isValid);
    } catch (error) {
      console.error("Part number validation error:", error);
      setIsValidPartNumber(false);
    } finally {
      setCheckingPartNumber(false);
    }
  };

  const ai = new GoogleGenAI({ apiKey: "" });

const generateDescriptionAI = async (title) => {
  try {
    if (!title || typeof title !== "string") {
      throw new Error("Invalid product title.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a brief description for the product: ${title}`,
    });

    if (response && response.text) {
      return response.text.trim(); 
    } else {
      throw new Error("No generated text in the response.");
    }
  } catch (error) {
    console.error("Error generating description:", error);
    return "Failed to generate description"; 
  }
};

const handleGenerateDescription = async () => {
  setLoading(true);
  const descresult = await generateDescriptionAI(title);
  setDescription(descresult); 
  setLoading(false);
};

  return (
    <div className="min-h-screen bg-custom-white dark:bg-custom-dark flex items-center justify-center py-12 px-6">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">{t('Sell Your Product')}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Title */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold"> {t('Product Title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
      <label className="block text-gray-700 dark:text-gray-300 font-semibold">
      {t('Product Description')}
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
        required
      ></textarea>

      <div className="mt-2">
      <button
      onClick={handleGenerateDescription}
      type="button"
      disabled={loading}
      className="p-2 text-white rounded-md hover:bg-blue-700 focus:outline-none"
    >
      {loading ? (
        <span>{t('Generating...')}</span> 
      ) : (
        <img 
          src={geminiIcon} 
          alt="Gemini Icon" 
          className="h-6 w-6"
        />
      )}
    </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>

          {/* Product Price */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Price')}</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Product Quantity */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Quantity')}</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">{t('Select a category')}</option>
              <option value="car_parts">{t('Car Parts')}</option>
              <option value="accessories">{t('Car Accessories')}</option>
            </select>
          </div>
          {/* Car Parts Type */}
          {category === "car_parts" && (
    <div>
      <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Car Part Type')}</label>
      <select
        value={carPartsType}
        onChange={(e) => setCarPartsType(e.target.value)}
        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
        required
      >
        <option selected value="Engine">{t('engine')}</option>
<option value="Transmission">{t('transmission')}</option>
<option value="Brakes">{t('brakes')}</option>
<option value="Suspension">{t('suspension')}</option>
<option value="Cooling">{t('cooling_system')}</option>
<option value="Electrical">{t('electrical_components')}</option>
<option value="Interior_seats">{t('interior_seats')}</option>
<option value="Interior_dashboard">{t('interior_dashboard')}</option>
<option value="Exterior_bumpers">{t('exterior_bumpers')}</option>
<option value="Exterior_mirrors">{t('exterior_mirrors')}</option>
<option value="Lighting">{t('lighting')}</option>
<option value="HVAC">{t('hvac')}</option>

      </select>
    </div>
)}
          {/* Part Number (Only visible for Car Parts category) */}
          {category === "car_parts" && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Part Number')}</label>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => {setPartNumber(e.target.value); setIsValidPartNumber(null);}}
                onBlur={() => {
                  if (partNumber.trim()) { 
                    validatePartNumber(partNumber);
                  }
                }}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          )}
          {checkingPartNumber && (
  <p className="text-sm text-blue-500 mt-1">Checking part number...</p>
)}

{isValidPartNumber === true && (
  <p className="text-sm text-green-600 mt-1">✅ Valid part number!</p>
)}

{isValidPartNumber === false && (
  <p className="text-sm text-red-600 mt-1">❌ Invalid part number. </p>
)}

          {/* Car Manufacturer (Only visible for Car Parts category) */}
          {category === "car_parts" && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Car Manufacturer')}</label>
              <select
                value={carManufacturer}
                onChange={(e) => {
                  setCarManufacturer(e.target.value);
                  fetchCarModels(e.target.value); // Fetch models when manufacturer is selected
                }}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">{t('Select Car Manufacturer')}</option>
                {carManufacturers.map((manufacturer, index) => (
                  <option key={index} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </div>
          )}

          {/* Car Model (Only visible for Car Parts category) */}
          {category === "car_parts" && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Car Model')}</label>
              <select
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">{t('Select Car Model')}</option>
                {carModels.map((model, index) => (
                  <option key={index} value={model}>{model}</option>
                ))}
              </select>
            </div>
          )}

          {/* Car Year (Only visible for Car Parts category) */}
          {category === "car_parts" && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">Car Year</label>
              <select
                value={carYear}
                onChange={(e) => setCarYear(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">{t('Select Car Year')}</option>
                {generateCarYears().map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          {category === "accessories" && (
  <div className="mt-4">
    <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Subcategory')}</label>
    <select
      value={subCategory}
      onChange={(e) => setSubCategory(e.target.value)}
      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
      required
    >
      <option value="">{t('Select a subcategory')}</option>
      <option value="interior">{t('Interior')}</option>
      <option value="exterior">{t('Exterior')}</option>
    </select>
  </div>
)}
          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t('Product Images')}</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          {/* Location */}
<div className="flex flex-col">
  <label className="block text-gray-700 dark:text-gray-300 font-semibold">
    {t('Location')}
  </label>
  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-green-600 dark:bg-gray-700">
    <input
      type="text"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      className="w-full p-4 bg-transparent dark:text-white focus:outline-none"
      required
    />
    <button
      type="button"
      onClick={() => setShowMap(!showMap)}
      className="px-4 py-2 text-white rounded-r-md hover:bg-green-700 transition"
    >
      <img src={mapIcon} alt="Map Icon" className="h-8 w-9" />
    </button>
  
</div>

    </div>
          {/* Map */}
          {showMap && (
            <div id="map" className="w-full h-72 mt-4"></div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-green-700 dark:hover:bg-green-800"
            >
              {t('Submit Listing')}
            </button>
          </div>
        </form>
      </div>
      {/* Modal for Loading and Success */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
            {!isSuccess ? (
              <>
                {/* Loading Animation (Spinner) */}
                <div className="flex justify-center items-center mb-4">
                  <div className="animate-spin rounded-full border-t-4 border-green-500 border-solid w-16 h-16"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-700 dark:text-white">{t('Uploading...')}</h2>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(uploadProgress.reduce((a, b) => a + b, 0) / images.length, 100)}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <div className="text-green-500 text-5xl mb-4">
                  ✔️
                </div>
                <h2 className="text-xl font-bold text-gray-700 dark:text-white">{t('Product Listed Successfully!')}</h2>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sell;
