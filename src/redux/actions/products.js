import { db } from '/home/leul/Desktop/s/src/components/Firebase.js';  // Make sure to import the initialized Firestore instance
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Action to fetch all products
export const productsAction = () => async (dispatch) => {
  try {
    // Get reference to 'products' collection in Firestore
    const productsCollectionRef = collection(db, 'Products');

    // Fetch all products from Firestore
    const productSnapshot = await getDocs(productsCollectionRef);
    const productList = productSnapshot.docs.map(doc => ({
      id: doc.id, // Get Firestore document ID
      ...doc.data() // Get the fields of the document
    }));

    console.log("Fetched products from Firestore:", productList);

    // Dispatch the products list to Redux store
    dispatch({
      type: 'GET_PRODUCTS',
      payload: productList,
    });
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
  }
};

// Action to fetch a single product's details
export const productDetailAction = (id) => async (dispatch) => {
  try {
    // Get reference to the specific product document by ID
    const productDocRef = doc(db, 'products', id);

    // Fetch the product document from Firestore
    const productDoc = await getDoc(productDocRef);

    if (productDoc.exists()) {
      const productData = productDoc.data();

      // Dispatch the product details to Redux store
      dispatch({
        type: 'GET_DETAILS',
        payload: {
          id: productDoc.id,  // Firestore document ID
          ...productData,      // Product fields
        },
      });
    } else {
      console.log("No product found with the given ID");
    }
  } catch (error) {
    console.error("Error fetching product details from Firestore:", error);
  }
};
