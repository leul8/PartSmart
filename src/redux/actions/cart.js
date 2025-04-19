import { db } from '/home/leul/Desktop/s/src/components/Firebase.js'; // Import the Firestore instance
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods

// Add to Cart Action
export const cartAction = (id, quantity) => async (dispatch, getState) => {
  try {
    // Get a reference to the Firestore document based on the product ID
    const productDocRef = doc(db, "Products", id); // Assuming "Products" is your Firestore collection name
    
    // Fetch the product document from Firestore
    const productDoc = await getDoc(productDocRef);
    
    if (productDoc.exists()) {
      const productData = productDoc.data();
      
      // Check if 'images' is an array and get the first image, otherwise use the image directly
      const productImage = Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images[0] // Use the first image if it's an array
        : productData.images;    // Otherwise, just use the single image

      // Dispatch the ADD_CART action with product data
      dispatch({
        type: 'ADD_CART',
        payload: {
          id: productDoc.id,        // Firestore document ID
          image: productImage,      // The appropriate image
          title: productData.title,
          description: productData.description,
          price: productData.price,
          qty: quantity,
        },
      });

      // Get the updated cart items from Redux state
      const { cart: { cartItems } } = getState();

      // Save the updated cart to localStorage
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      console.log("No such product found in Firestore!");
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
};

// Remove from Cart Action
export const removeCartAction = (productId) => (dispatch, getState) => {
  try {
    // Dispatch REMOVE_CART action
    dispatch({ type: 'REMOVE_CART', payload: productId });

    // Get the updated cart items from Redux store
    const { cart: { cartItems } } = getState();

    // Save the updated cart to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error removing product from cart:", error);
  }
};
