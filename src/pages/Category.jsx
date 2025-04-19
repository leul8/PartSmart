import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { productsAction } from '../redux/actions/products';
import ProductItems from '../components/ProductItems';
import { searchAction } from '../redux/actions/search';
import { useTranslation } from "react-i18next";

function Category() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { search } = useSelector((state) => state.search);
  const darkMode = useSelector((state) => state.darkMode); 
  // Local states for filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [carPartsTypeFilter, setCarPartsTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [carManufacturers, setCarManufacturers] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [carPartsTypes, setCarPartsTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  
  const generateCarYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1900; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  async function fetchManufacturers() {
    setLoading(true);
    setError('');
    const url = 'https://car-api2.p.rapidapi.com/api/makes?direction=asc&sort=id';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'e4b7473ce9msh3e68e8ae697e503p154e13jsn4edf2eb4d813',
        'x-rapidapi-host': 'car-api2.p.rapidapi.com',
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const carNames = data.data.map((item) => item.name);
      setCarManufacturers(carNames);
    } catch (error) {
      setError('Error fetching manufacturers. Please try again later.');
      console.error('Error fetching manufacturers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCarModels(manufacturer) {
    if (!manufacturer) return;
    const url = `https://car-api2.p.rapidapi.com/api/models?make=${manufacturer}&sort=id&direction=asc&year=2020&verbose=yes`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'e4b7473ce9msh3e68e8ae697e503p154e13jsn4edf2eb4d813',
        'x-rapidapi-host': 'car-api2.p.rapidapi.com',
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const models = data.data.map((item) => item.name);
      setCarModels(models);
    } catch (error) {
      console.error('Error fetching car models:', error);
    }
  }

  useEffect(() => {
    dispatch(productsAction());
    dispatch(searchAction());
    fetchManufacturers();
  }, [dispatch]);

  async function fetchCarPartsTypes() {
    const types = ['Engine', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Cooling','Interior_seats', 'Interior_dashboard', 'Exterior_bumpers', 'Exterior_mirrors', 'Lighting', 'HVAC']; // Mocked types, ideally fetched from an API
    setCarPartsTypes(types);
  }

  useEffect(() => {
    if (categoryFilter === 'car_parts') {
      fetchCarPartsTypes(); 
    }
  }, [categoryFilter]);

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setSubCategoryFilter(''); 
    setCarPartsTypeFilter(''); 
  };

  const handleSubCategoryChange = (e) => {
    setSubCategoryFilter(e.target.value);
  };

  const handleManufacturerChange = (e) => {
    const manufacturer = e.target.value;
    setManufacturerFilter(manufacturer);
    fetchCarModels(manufacturer); 
  };

  const handleModelChange = (e) => {
    setModelFilter(e.target.value);
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleCarPartsTypeChange = (e) => {
    setCarPartsTypeFilter(e.target.value);
  };

  const applyFilters = (products) => {
    let filteredProducts = [...products];

    if (categoryFilter) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (categoryFilter === 'accessories' && subCategoryFilter) {
      filteredProducts = filteredProducts.filter(
        (product) => product.subCategory === subCategoryFilter
      );
    }

    if (categoryFilter === 'car_parts') {
      console.log("Filtering car parts...");

      if (manufacturerFilter) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.carManufacturer &&
            product.carManufacturer.toLowerCase() === manufacturerFilter.toLowerCase()
        );
        console.log("Filtered by manufacturer:", manufacturerFilter);
      }

      if (modelFilter) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.carModel &&
            product.carModel.toLowerCase() === modelFilter.toLowerCase()
        );
        console.log("Filtered by model:", modelFilter);
      }

      if (yearFilter) {
        filteredProducts = filteredProducts.filter(
          (product) => product.carYear === yearFilter
        );
        console.log("Filtered by year:", yearFilter);
      }

      if (carPartsTypeFilter) {
        filteredProducts = filteredProducts.filter(
          (product) => product.carPartsType === carPartsTypeFilter
        );
        console.log("Filtered by car parts type:", carPartsTypeFilter);
      }
    }

if (sortOrder === 'newest') {
  filteredProducts = filteredProducts.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
    const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
    return dateB - dateA;  
  });
} else if (sortOrder === 'oldest') {
  filteredProducts = filteredProducts.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
    const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
    return dateA - dateB;  
  });
}

if (priceFilter === 'low-high') {
  filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
} else if (priceFilter === 'high-low') {
  filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
}

    

    return filteredProducts;
  };

  const filteredProducts = applyFilters(search.length > 0 ? search : products);

  return (
    <div style={{ marginTop: '80px' }}>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4 sm:gap-2">
        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
          className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
        >
          <option value="">{t('All Categories')}</option>
          <option value="accessories">{t('Accessories')}</option>
          <option value="car_parts">{t('Car Parts')}</option>
        </select>
  
        {/* Subcategory Filter (only for accessories) */}
        {categoryFilter === 'accessories' && (
          <select
            value={subCategoryFilter}
            onChange={handleSubCategoryChange}
            className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
          >
            <option value="">{t('Select Subcategory')}</option>
            <option value="interior">{t('Interior')}</option>
            <option value="exterior">{t('Exterior')}</option>
          </select>
        )}
  
        {/* Manufacturer Filter (only for car parts) */}
        {categoryFilter === 'car_parts' && (
          <select
            value={manufacturerFilter}
            onChange={handleManufacturerChange}
            className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
          >
            <option value="">{t('Select Manufacturer')}</option>
            {carManufacturers.map((manufacturer, index) => (
              <option key={index} value={manufacturer}>
                {manufacturer}
              </option>
            ))}
          </select>
        )}
  
        {/* Model Filter (only for car parts) */}
        {categoryFilter === 'car_parts' && (
          <select
            value={modelFilter}
            onChange={handleModelChange}
            className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
          >
            <option value="">{t('Select Model')}</option>
            {carModels.map((model, index) => (
              <option key={index} value={model}>
                {model}
              </option>
            ))}
          </select>
        )}
  
        {/* Year Filter (only for car parts) */}
        {categoryFilter === 'car_parts' && (
          <select
            value={yearFilter}
            onChange={handleYearChange}
            className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
          >
            <option value="">{t('Select Year')}</option>
            {generateCarYears().map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
  
        {/* Car Parts Type Filter (only for car parts) */}
        {categoryFilter === 'car_parts' && (
          <select
            value={carPartsTypeFilter}
            onChange={handleCarPartsTypeChange}
            className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
          >
            <option value="">{t('Select Part Type')}</option>
            {carPartsTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
  
        {/* Price Filter */}
        <select
          value={priceFilter}
          onChange={handlePriceChange}
          className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
        >
          <option value="">{t('Price')}</option>
          <option value="low-high">{t('Low to High')}</option>
          <option value="high-low">{t('High to Low')}</option>
        </select>
  
        {/* Sort Filter */}
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className="px-4 py-2 border rounded text-gray-700 dark:text-white dark:bg-gray-800 shadow dark:shadow-slate-500 w-full sm:w-auto"
        >
          <option value="newest">{t('Newest')}</option>
          <option value="oldest">{t('Oldest')}</option>
        </select>
      </div>
  
      <div className="flex flex-wrap justify-center">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((val, i) => (
            <ProductItems key={i} val={val} />
          ))
        ) : (
          <p>{t('No products found with the selected filters.')}</p>
        )}
      </div>
    </div>
  );
}  
export default Category;
