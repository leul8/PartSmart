import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { productsAction } from '../redux/actions/products';
import ProductItems from '../components/ProductItems';
import Slider from '../components/Slider';

function Home() {
  const dispatch = useDispatch();
  const { products } = useSelector(state => state.products);
  const { search, hasSearched } = useSelector(state => state.search);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState([]);

  // 1. Fetch all products once on mount
  useEffect(() => {
    (async () => {
      await dispatch(productsAction());
      setLoading(false);
    })();
  }, [dispatch]);

  // 2. When products arrive, show the first 20
  useEffect(() => {
    if (products.length > 0) {
      setVisibleProducts(products.slice(0, 20));
    }
  }, [products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center mt-20">
        <div className="animate-spin h-10 w-10 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <Slider />

      <div className="flex flex-wrap justify-center mt-6">
        {hasSearched ? (
          // **AFTER** the user has searched
          search.length > 0 ? (
            search.map((item, idx) => <ProductItems key={idx} val={item} />)
          ) : (
            <div className="text-center text-gray-500 text-lg mt-10">
              No results found.
            </div>
          )
        ) : (
          // **BEFORE** any search (initial load)
          visibleProducts.length > 0 ? (
            visibleProducts.map((item, idx) => <ProductItems key={idx} val={item} />)
          ) : (
            <div className="text-center text-gray-500 text-lg mt-10">
              No products available.
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Home;
