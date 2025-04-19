import React, { useEffect, useState } from "react";
import { BiUserCircle, BiBasket } from "react-icons/bi";
import { BsGear } from "react-icons/bs";
import { FaListAlt } from "react-icons/fa"; // Import the list icon
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { db } from "/home/leul/Desktop/s/src/components/Firebase.js"; // Import the Firestore database instance
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"; // Import Firestore methods
import { FaStar } from "react-icons/fa";
import { getAuth, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { t } from "i18next";
import { useTranslation } from "react-i18next"; // Import useTranslation for multi-language support

function User() {
  const [openTab, setOpenTab] = useState(1); // For handling tab switch
  const [user, setUser] = useState(null); // For storing user details
  const { cartItems } = useSelector((state) => state.cart); // Cart items from Redux state
  const auth = getAuth(); // Firebase auth instance
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]); // State to store products
  const [selectedProduct, setSelectedProduct] = useState(null); // For storing selected product for editing
  const [showModal, setShowModal] = useState(false); // For controlling modal visibility
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    password: '',      // current password
    newPassword: '',   // new password
  });
  
  const [orders, setOrders] = useState([]); // State to store orders
  const [openModal, setOpenModal] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const { t } = useTranslation(); // useTranslation hook for language support
  
 
  const subscribeToPremium = () => {
     setOpenModal(false); 
     setIsSubscriptionModalOpen(true);

    // Optionally, close the modal after a delay (e.g., 3 seconds)
    setTimeout(() => {
      setIsSubscriptionModalOpen(false); // Close the modal after 3 seconds
    }, 3000);
  };
  
  useEffect(() => {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the user if logged in
        // Fetch the user's products from Firestore when the user is logged in
        fetchUserProducts(user.uid); // Use displayName as the username to filter products
      }
    });
  }, []);

  const fetchUserProducts = async (uid) => {
    try {
      const productsCollectionRef = collection(db, "Products"); 
      const q = query(productsCollectionRef, where("uid", "==", uid)); 
      const snapshot = await getDocs(q); 
      if (!snapshot.empty) {
        const fetchedProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })); 
        setProducts(fetchedProducts);
      } else {
        console.log("No products found for this user.");
      }
    } catch (error) {
      console.error("Error fetching products: ", error); 
    }
  };

  const handleDelete = async (id) => {
    try {
      const productRef = doc(db, "Products", id);
      await deleteDoc(productRef); 
      setProducts(products.filter((product) => product.id !== id)); 
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };


  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  
  const handleUpdate = async (updatedProduct) => {
    try {
      const productRef = doc(db, "Products", updatedProduct.id);
      await updateDoc(productRef, updatedProduct);
      setProducts(
        products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };
  
  
  // ...
  

  const handleProfileUpdate = async () => {
    const auth = getAuth(); 
    
    if (user) {
      try {
        const credential = EmailAuthProvider.credential(user.email, userProfile.password);
        await reauthenticateWithCredential(user, credential);
  
        if (userProfile.newPassword) {
          await updatePassword(user, userProfile.newPassword);
        }
  
        await updateProfile(user, {
          displayName: userProfile.displayName,
        });
  
        setSuccessMessage("Profile updated successfully!");
        setErrorMessage(""); 
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
          setErrorMessage("You need to sign in again to update your password.");
        } else {
          setErrorMessage("Error updating profile: " + error.message);
        }
  
        setSuccessMessage("")
      }
    }
  };

  
  
  
  
  const fetchUserOrders = async (uid) => {
    try {
      const ordersCollectionRef = collection(db, "Orders");
      const q = query(ordersCollectionRef, where("userId", "==", uid));
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders); 
      } else {
        console.log("No orders found for this user.");
      }
    } catch (error) {
      console.error("Error fetching orders: ", error);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUserProducts(user.uid); 
      fetchUserOrders(user.uid); 
    }
  }, [user]);
  
  
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-24">
    <div className="overflow-x-hidden">
      <div className="py-12 px-4 sm:px-6 lg:px-24">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <a href="#" className="hover:underline hover:text-gray-600">{t('Home')}</a>
            <span>
              <svg
                className="h-5 w-5 leading-none text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
            <a href="#" className="hover:underline hover:text-gray-600">{t('User')}</a>
          </div>
        </div>
        <div className="mt-8">
          <h1 className="text-2xl font-medium">{t('My Account')}</h1>
        </div>
        <div>
          <div className="mx-auto mt-12">
            <div className="flex flex-col md:flex-row">
              <ul className="flex flex-col space-y-4 w-full md:w-1/6">
                <li>
                  <a
                    onClick={() => setOpenTab(1)}
                    className={`${
                      openTab === 1 ? "bg-gray-200 text-custom-dark-green dark:bg-gray-800" : ""
                    } flex px-8 py-1 text-gray-600 bg-custom-white dark:bg-custom-dark dark:text-custom-dark-green rounded cursor-pointer`}
                  >
                    <BiUserCircle className="self-center mr-2" /> {t('My Details')}
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setOpenTab(2)}
                    className={`${
                      openTab === 2 ? "bg-gray-200 text-custom-dark-green dark:bg-gray-800" : ""
                    } flex px-8 py-1 text-gray-600 bg-custom-white dark:bg-custom-dark dark:text-custom-dark-green rounded cursor-pointer`}
                  >
                    <BiBasket className="self-center mr-2" /> {t('Orders')}
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setOpenTab(3)}
                    className={`${
                      openTab === 3 ? "bg-gray-200 text-custom-dark-green dark:bg-gray-800" : ""
                    } flex px-8 py-1 text-gray-600 bg-custom-white dark:bg-custom-dark dark:text-custom-dark-green rounded cursor-pointer`}
                  >
                    <BsGear className="self-center mr-2" /> {t('Settings')}
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setOpenTab(4)}
                    className={`${
                      openTab === 4 ? "bg-gray-200 text-custom-dark-green dark:bg-gray-800" : ""
                    } flex px-8 py-1 text-gray-600 bg-custom-white dark:bg-custom-dark dark:text-custom-dark-green rounded cursor-pointer`}
                  >
                    <FaListAlt className="self-center mr-2" /> {t('Listings')}
                  </a>
                </li>
              </ul>
              <div className="p-3 bg-white dark:bg-custom-dark-second rounded-xl ml-0 md:ml-12 w-full md:w-4/5">
                <div className={openTab === 1 ? "block" : "hidden"}>
                  <div className="w-full lg:w-4/12 px-4 mx-auto h-auto">
                    <div className="px-6 py-24">
                      <div className="flex flex-wrap justify-center">
                        <div className="w-full px-4 flex justify-center">
                          <div>
                            <img
                              src="https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"
                              className="shadow-xl rounded-full h-auto align-middle border-none w-48 sm:w-36 xs:w-28 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-12">
                        <h3 className="text-xl font-semibold leading-normal text-blueGray-700 mb-2">
                          {user?.displayName}
                        </h3>
                        <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                          <i className="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                          {user?.email} 
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={openTab === 3 ? "block" : "hidden"}>
  <h2 className="text-xl font-bold text-black dark:text-custom-light-green">{t('Update Profile')}</h2>
  <div className="mt-4">
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Display Name')}</label>
      <input
        type="text"
        value={userProfile.displayName}
        onChange={(e) => setUserProfile({ ...userProfile, displayName: e.target.value })}
        className="mt-1 p-2 w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Current Password')}</label>
      <input
        type="password"
        value={userProfile.password}
        onChange={(e) => setUserProfile({ ...userProfile, password: e.target.value })}
        className="mt-1 p-2 w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('New Password')}</label>
      <input
        type="password"
        value={userProfile.newPassword}
        onChange={(e) => setUserProfile({ ...userProfile, newPassword: e.target.value })}
        className="mt-1 p-2 w-full border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200"
      />
    </div>

    <div className="text-right">
      <button
        onClick={handleProfileUpdate}
        className="bg-blue-500 text-white py-2 px-4 rounded-md"
      >
        {t('Update Profile')}
      </button>
    </div>

    {/* Success or Error Message */}
    {successMessage && (
      <div className="mt-4 text-green-500 dark:text-green-300">
        {successMessage}
      </div>
    )}

    {errorMessage && (
      <div className="mt-4 text-red-500 dark:text-red-300">
        {errorMessage}
      </div>
    )}
  </div>
</div>

                {/* Listings Section */}
                <div className={openTab === 4 ? "block" : "hidden"}>
                  <h2 className="text-xl font-bold text-black dark:text-custom-light-green">
                  {t('My Listings')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products
                      .filter((product) => product.uid === user?.uid) 
                      .map((product, index) => (
                        <div
                          key={index}
                          className="bg-custom-light-gray dark:bg-custom-dark-gray p-4 rounded-xl shadow-md hover:shadow-xl transition duration-300"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-32 object-cover rounded-md mb-4"
                          />
                          <h3 className="text-lg font-semibold text-black dark:text-custom-light-green">
                            {product.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {product.carManufacturer && product.carModel ? `${product.carManufacturer} - ${product.carModel}` : "Accessories"}
</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400"> {t('Condition')}: {product.condition}</p>
                          <p className="text-xl font-bold text-black dark:text-custom-light-green">
                            {product.price} {t('ETB')}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('Location')}: {product.location}</p>
  
                          <div className="flex justify-between mt-4">
                            <button
                              onClick={() => handleEdit(product)} 
                              className="text-blue-500 hover:text-blue-700 transition duration-300"
                            >
                              {t('Edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)} 
                              className="text-red-500 hover:text-red-700 transition duration-300"
                            >
                              {t('Delete')}
                            </button>
                          </div>
  
                          {/* Premium Button */}
                          <button
                            onClick={() => setOpenModal(true)}
                            className="flex items-center mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600 transition duration-300"
                          >
                            <FaStar className="mr-2" /> {t('Premium Listing')}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
  
    {/* Premium Subscription Modal */}
  {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold text-center text-black dark:text-white mb-4">
            {t('Subscribe to Premium')}
            </h3>
            <p className="text-sm text-center text-gray-500 dark:text-gray-300 mb-4">
            {t('Subscribe to premium to feature your listing before others.')}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => subscribeToPremium()}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
              >
                {t('Subscribe')}
              </button>
              <button
                onClick={() => setOpenModal(false)} 
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
{isSubscriptionModalOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">{t('Successfully Subscribed!')}</h2>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{t('You have successfully subscribed to premium.')}</p>
      <button
        onClick={() => setIsSubscriptionModalOpen(false)} // Close the modal
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        {t('Close')}
      </button>
    </div>
  </div>
)}


              {/* Edit Modal */}
{showModal && (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-11/12 md:w-11/12 lg:w-10/12 xl:w-8/12 mt-20 max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">{t('Edit Product')}</h3>

      {/* Common Fields for all Product Types */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Title')}</label>
          <input
            type="text"
            value={selectedProduct.title}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                title: e.target.value,
              })
            }
            className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Description')}</label>
          <input
            type="text"
            value={selectedProduct.description}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                description: e.target.value,
              })
            }
            className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Condition')}</label>
          <input
            type="text"
            value={selectedProduct.condition}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                condition: e.target.value,
              })
            }
            className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Price')}</label>
          <input
            type="number"
            value={selectedProduct.price}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                price: e.target.value,
              })
            }
            className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Quantity')}</label>
          <input
            type="number"
            value={selectedProduct.quantity}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                quantity: e.target.value,
              })
            }
            className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Location')}</label>
          <input
            type="text"
            value={selectedProduct.location}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                location: e.target.value,
              })
            }
            className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Conditional Fields for Car Parts */}
      {selectedProduct.category === 'car_parts' && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Part Number')}</label>
            <input
              type="text"
              value={selectedProduct.partNumber}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  partNumber: e.target.value,
                })
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Car Model')}</label>
            <input
              type="text"
              value={selectedProduct.carModel}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  carModel: e.target.value,
                })
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Car Year')}</label>
            <input
              type="text"
              value={selectedProduct.carYear}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  carYear: e.target.value,
                })
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Car Manufacturer')}</label>
            <input
              type="text"
              value={selectedProduct.carManufacturer}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  carManufacturer: e.target.value,
                })
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Car Parts Type')}</label>
            <input
              type="text"
              value={selectedProduct.carPartsType}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  carPartsType: e.target.value,
                })
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
            />
          </div> {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Category')}</label>
          <input
            type="text"
            value={selectedProduct.category}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                category: e.target.value,
              })
            }
            className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
          />
        </div>
        </div>
      )}

      {/* Conditional Fields for Car Accessories */}
      {selectedProduct.category === 'car_accessories' && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Sub Category')}</label>
            <input
              type="text"
              value={selectedProduct.subCategory}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  subCategory: e.target.value,
                })
              }
              className="border border-gray-300 dark:border-gray-600 p-2 w-full mb-4 rounded text-black dark:text-white bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded dark:bg-gray-600"
        >
         {t('Close')}
        </button>
        <button
          onClick={() => handleUpdate(selectedProduct)}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2 dark:bg-blue-700"
        >
          {t('Save Changes')}
        </button>
      </div>
    </div>
  </div>
)}

              {/* Orders Section */}
<div className={openTab === 2 ? "block" : "hidden"}>
  <h2 className="text-xl font-bold text-black dark:text-custom-light-green">
  {t('My Orders')}
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {orders.length > 0 ? (
      orders.map((order, index) => (
        <div
          key={index}
          className="bg-custom-light-gray dark:bg-custom-dark-gray p-4 rounded-xl shadow-md hover:shadow-xl transition duration-300"
        >
          {/* Product Image */}
          <img
            src={order.products[0].imageUrl} // Assuming the order contains a product image
            alt={order.products[0].title}
            className="w-full h-32 object-cover rounded-md mb-4"
          />

          {/* Order Details */}
          <h3 className="text-lg font-semibold text-black dark:text-custom-light-green">
          {t('Order #')}{order.orderId}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('Product')}: {order.products[0].title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('Quantity')}: {order.products[0].quantity}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('Status')}: {order.orderStatus}</p>
          <p className="text-xl font-bold text-black dark:text-custom-light-green">
            {order.totalAmount} {t('ETB')}
          </p>
          
          {/* Order Date */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('Order Date')}: {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleDateString() : "Invalid Date"}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 dark:text-gray-400">{t('No orders found.')}</p>
    )}
  </div>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default User;
