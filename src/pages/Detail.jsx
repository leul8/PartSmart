import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, onSnapshot, serverTimestamp, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "/home/leul/Desktop/s/src/components/Firebase.js";
import { CgMathMinus, CgMathPlus } from "react-icons/cg";
import { cartAction } from "../redux/actions/cart";
import { useTranslation } from 'react-i18next';

function Detail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product } = useSelector((state) => state.productDetail);

  const [count, setCount] = useState(1);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productDocRef = doc(db, "Products", id);
        const productDocSnap = await getDoc(productDocRef);
        if (productDocSnap.exists()) {
          setProductData(productDocSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const q = query(collection(db, "Reviews"), where("productId", "==", id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewData);
    });
    return () => unsubscribe();
  }, [id]);

  const increment = () => {
    if (count < Number(productData?.quantity)) {
      setCount(count + 1);
    }
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const addCart = () => {
    if (productData) {
      dispatch(cartAction(id, count));
    }
  };

  const handlePostReview = async () => {
    if (!review.trim() || !user) return;
    try {
      await addDoc(collection(db, "Reviews"), {
        text: review,
        productId: id,
        uid: user.uid,
        username: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setReview("");
    } catch (err) {
      console.error("Error posting review:", err);
    }
  };

  if (loading) {
    return <div>{t('Loading...')}</div>;
  }

  const productImages = Array.isArray(productData?.images) && productData?.images.length > 0
    ? productData?.images
    : [productData?.image];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < productImages.length - 1 ? prevIndex + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : productImages.length - 1
    );
  };

  return (
    <div className="antialiased">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-gray-400 text-sm dark:text-gray-300">
            <a href="#" className="hover:underline hover:text-gray-600 dark:hover:text-white">{t('Home')}</a>
            <span>&gt;</span>
            <a href="#" className="hover:underline hover:text-gray-600 dark:hover:text-white">{t('Products')}</a>
            <span>&gt;</span>
            <span className="dark:text-white">{productData?.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="flex flex-col md:flex-row -mx-4">
            <div className="md:flex-1 px-4">
              <div className="flex justify-center">
                <div className="relative h-64 md:h-80 rounded-lg bg-gray-100 mb-4 dark:bg-gray-700">
                  <img
                    className="h-80 object-cover"
                    src={productImages[currentImageIndex]}
                    alt={productData?.title}
                  />
                  {productImages.length > 1 && (
                    <>
                      <button
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-gray-800 opacity-70 p-3 rounded-full hover:bg-gray-600 transition"
                        onClick={prevImage}
                      >
                        &lt;
                      </button>
                      <button
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-gray-800 opacity-70 p-3 rounded-full hover:bg-gray-600 transition"
                        onClick={nextImage}
                      >
                        &gt;
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xl font-semibold">
                    {currentImageIndex + 1} {t('of')} {productImages.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:flex-1 px-4 md:mt-0 min-[240px]:mt-24">
              <h2 className="mb-2 leading-tight tracking-tight font-bold text-2xl md:text-3xl dark:text-white">
                {productData?.title}
              </h2>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                {t('By')} <a href="#" className="text-green-600 hover:underline dark:text-green-400">{productData?.username || t('Unknown Seller')}</a>
              </p>

              <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">
                <strong>{t('Location')}:</strong> {productData?.location || t('N/A')}
              </p>

              {productData?.category === "car_parts" && (
                <div className="mt-4 text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>{t('Manufacturer')}:</strong> {productData?.carManufacturer || t('N/A')}</p>
                  <p><strong>{t('Model')}:</strong> {productData?.carModel || t('N/A')}</p>
                  <p><strong>{t('Year')}:</strong> {productData?.carYear || t('N/A')}</p>
                  <p><strong>{t('Part Number')}:</strong> {productData?.partNumber || t('N/A')}</p>
                </div>
              )}

              {productData?.category === "accessories" && (
                <div className="mt-4 text-gray-600 dark:text-gray-300">
                  <p><strong>{t('Type')}:</strong> {productData?.subCategory || t('N/A')}</p>
                </div>
              )}

              <div className="flex py-4 space-x-4">
                <div className="flex mx-2 space-x-2 items-center">
                  <button onClick={decrement}>
                    <CgMathMinus size={24} className="border rounded-full p-1 cursor-pointer" />
                  </button>
                  <span className="text-xl select-none dark:text-white">{count}</span>
                  <button onClick={increment}>
                    <CgMathPlus size={24} className="border rounded-full p-1 cursor-pointer" />
                  </button>
                </div>
                <button
                  type="button"
                  className="h-14 px-6 py-2 font-semibold rounded-xl bg-green-600 hover:bg-green-700 text-white"
                  onClick={addCart}
                >
                  {t('Add to Cart')}
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2 dark:text-white">{t('Product Description')}</h3>
                <p className="text-gray-600 text-sm dark:text-gray-400">
                  {productData?.description || t('No description available for this product.')}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
<div className="mt-16">
  <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('Reviews')}</h3>

  {user ? (
    <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder={t('Write your review here...')}
        className="w-full p-4 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        rows={4}
      />
      <button
        onClick={handlePostReview}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
      >
        {t('Post Review')}
      </button>
    </div>
  ) : (
    <p className="text-gray-600 dark:text-gray-300">{t('Please log in to post a review.')}</p>
  )}

  {reviews.length > 0 ? (
    <ul className="space-y-6">
      {reviews.map((r) => (
        <li key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {r.username ? r.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">{r.username || "Anonymous"}</p>
              {r.createdAt?.toDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {r.createdAt.toDate().toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{r.text}</p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 dark:text-gray-400 mt-4">{t('No reviews yet.')}</p>
  )}
</div>
    </div>
      </div>
    </div>
  );
}

export default Detail;
