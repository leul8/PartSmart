import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeCartAction } from "../redux/actions/cart"; 
import { db, auth } from "../components/Firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next"; 
import { useNavigate } from "react-router-dom"; 

function Cart({ onClose }) {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart); 

  const [showConfirmation, setShowConfirmation] = useState(false); 
  const [checkedOutItems, setCheckedOutItems] = useState([]); 
  const [orderId, setOrderId] = useState(null); 
  const { t } = useTranslation(); 
  const navigate = useNavigate(); 

  
  const deleteItem = (id) => dispatch(removeCartAction(id));

  const handleCheckout = async () => {
    if (cartItems.length === 0) return; 

    const user = auth.currentUser; 
    if (!user) {
      
      navigate("/login"); 
      onClose(); 
      return; 
    }

    const userRef = doc(db, "users", user.uid); 
    const userSnap = await getDoc(userRef); 
    if (!userSnap.exists()) return; 

    const { username, email, uid } = userSnap.data(); 

    const generatedOrderId = `ORD-${Date.now()}`; 
    setOrderId(generatedOrderId); 

    
    const orderData = {
      orderId: generatedOrderId,
      userId: uid, 
      username,
      email,
      products: cartItems.map((item) => ({
        productId: item.id,
        title: item.title,
        price: Number(item.price),
        quantity: item.qty,
        imageUrl: item.image,
        dateAdded: new Date(),
      })),
      totalAmount: cartItems.reduce((t, i) => t + Number(i.price) * i.qty, 0), 
      orderDate: new Date(),
      orderStatus: "Finished", 
    };

    try {
      
      await addDoc(collection(db, "Orders"), orderData);
      dispatch({ type: "CLEAR_CART" }); 
      localStorage.removeItem("cartItems"); 
      setCheckedOutItems(cartItems); 
      setShowConfirmation(true); 
      setTimeout(() => {
        setShowConfirmation(false); 
        onClose(); 
      }, 3000);
    } catch (error) {
      console.error(t("checkout_error"), error); 
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.qty) * Number(item.price),
    0
  );

  return (
    
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end"
      onClick={onClose} 
    >
      {/* Cart container */}
      <div
        className="w-3/4 max-w-md p-6 border border-gray-300 rounded-xl shadow-lg bg-custom-white text-custom-dark dark:bg-custom-dark dark:text-custom-white overflow-y-auto h-5/6 z-50 mt-20 mr-4"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🛒 {t('Your cart')}</h2>
          <button
            className="text-xl hover:text-red-600"
            onClick={onClose} 
          >
            <AiOutlineClose className="cursor-pointer" />
          </button>
        </div>

        {/* Order confirmation */}
        {showConfirmation ? (
          <div className="text-center p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-green-600">🎉 {t('Order Confirmed')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('Thank you! you ordered: ')}</p>
            <ul className="text-left text-sm mb-6 max-h-48 overflow-y-auto">
              {checkedOutItems.map((item, i) => (
                <li key={i}>
                  {item.title} (x{item.qty}) – ${Number(item.price).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400">{t('order id')}: {orderId}</p>
          </div>
        ) : (
          <>
            {/* Cart items */}
            {cartItems.length > 0 ? (
              cartItems.map((item, i) => (
                <div key={i} className="mb-4 flex items-center gap-4 border-b pb-4">
                  <img
                    className="w-16 h-16 object-cover rounded-md"
                    src={item.image}
                    alt={item.title}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      ${Number(item.price).toFixed(2)} × {item.qty}
                    </p>
                  </div>
                  <button
                    className="text-red-500 hover:underline text-sm"
                    onClick={() => deleteItem(item.id)} 
                  >
                    {t('remove')}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">{t('Your cart is empty')}</p>
            )}

            {/* Checkout Section */}
            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>{t('Total')}:</span>
                <span>{subtotal.toFixed(2)} ETB</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className={`w-full mt-4 px-6 py-3 rounded-lg text-white font-semibold transition duration-300 
                       ${cartItems.length === 0
                       ? "bg-gray-300 cursor-not-allowed text-gray-600"
                       : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 active:from-green-600 active:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 focus:ring-opacity-50"
                       }`}
              >
                {t('Checkout')}
              </button>

              <p className="text-sm text-center mt-3">
                <button
                  className="text-light-blue-600 hover:text-light-blue-800 bg-transparent border-2 border-light-blue-600 hover:bg-light-blue-100 focus:ring-2 focus:ring-light-blue-500 rounded-lg py-2 px-4 transition-all duration-300 ease-in-out"
                  onClick={onClose} 
                >
                  ← {t('Continue shopping')}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
