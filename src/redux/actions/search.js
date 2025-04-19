// Import necessary Firestore methods (modular imports)
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Your Firebase config object (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyAiLLCZ5CDR9BVcb4Y_Q2DNZSS8Mw8Lnvk",
    authDomain: "e-com-8d439.firebaseapp.com",
    projectId: "e-com-8d439",
    storageBucket: "e-com-8d439.firebasestorage.app",
    messagingSenderId: "165745261186",
    appId: "1:165745261186:web:b40d6e4980ac8885d5929b",
    measurementId: "G-CTGLVTZJLX"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const searchAction = (keyword, searchType) => async (dispatch) => {
  try {
    const productsRef = collection(db, 'Products');
    const snapshot = await getDocs(productsRef);
    const allProducts = snapshot.docs.map((doc) => doc.data());

    const lowerKeyword = keyword.toLowerCase();
    let filtered = [];

    if (searchType === "partNumber") {
      // Filter only by partNumber
      filtered = allProducts.filter((item) =>
        item.partNumber?.toLowerCase().includes(lowerKeyword)
      );
    } else {
      // General search across multiple fields
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
