import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { productsAction } from '../redux/actions/products';
import { searchAction } from '../redux/actions/search';
import ProductItems from '../components/ProductItems';
import Slider from '../components/Slider';

function Home() {
  const dispatch = useDispatch();
  const { products } = useSelector(state => state.products);
  const { search } = useSelector(state => state.search);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(productsAction());
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    
    if (products.length > 0) {
      setVisibleProducts(products.slice(0, 20));
    }
  }, [products]);

  const handleSearch = async (keyword) => {
    setSearchLoading(true);
    await dispatch(searchAction(keyword));
    setSearchLoading(false);
  };

  const shouldShowNoResults = search.length === 0 && products.length > 0;

  return (
    <div>
      <Slider />

      {/* Search loading spinner */}
      {searchLoading ? (
        <div className="flex items-center justify-center mt-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
            <p className="mt-3 text-gray-600 dark:text-white">Searching...</p>
          </div>
        </div>
      ) : (
        <div className='flex flex-wrap justify-center'>
          {search.length > 0 ? (
            
            search.length > 0 ? (
              search.map((val, i) => <ProductItems key={i} val={val} />)
            ) : (
              <div className="text-center text-gray-500 text-lg mt-10">No results found.</div>
            )
          ) : (
            
            visibleProducts.length > 0 ? (
              visibleProducts.map((val, i) => <ProductItems key={i} val={val} />)
            ) : (
              <div className="text-center text-gray-500 text-lg mt-10">No products available.</div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
