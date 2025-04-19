import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Search action with type-based filtering
export const searchAction = (keyword, searchType = 'general') => async (dispatch) => {
  // Clear search if keyword is empty
  if (!keyword.trim()) {
    dispatch({ type: 'HAS_SEARCHED', payload: false });
    dispatch({ type: 'SEARCH', payload: [] });
    return;
  }

  dispatch({ type: 'HAS_SEARCHED', payload: true });

  try {
    const productsRef = collection(db, 'Products');
    const snapshot = await getDocs(productsRef);
    const allProducts = snapshot.docs.map((doc) => doc.data());

    const lowerKeyword = keyword.toLowerCase();
    let filtered = [];

    if (searchType === "partNumber") {
      filtered = allProducts.filter((item) =>
        item.partNumber?.toLowerCase().includes(lowerKeyword)
      );
    } else {
      filtered = allProducts.filter((item) =>
        item.title?.toLowerCase().includes(lowerKeyword) ||
        item.description?.toLowerCase().includes(lowerKeyword) ||
        item.category?.toLowerCase().includes(lowerKeyword)
      );
    }

    dispatch({ type: 'SEARCH', payload: filtered });

  } catch (err) {
    console.error('Error fetching products:', err);
  }
};
