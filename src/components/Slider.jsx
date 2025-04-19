import React, { useEffect, useState } from "react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { db } from "./Firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";  


const buttonStyle = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "24px",
  zIndex: 10,
  transition: "all 0.3s ease",
};


const properties = {
  prevArrow: (
    <button style={buttonStyle}>
      <IoIosArrowBack />
    </button>
  ),
  nextArrow: (
    <button style={buttonStyle}>
      <IoIosArrowForward />
    </button>
  ),
};


const divStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundSize: "cover",
  backgroundPosition: "center",
  height: "500px",
  borderRadius: "15px",
  position: "relative",
  overflow: "hidden",
};

function Slider() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const fetchPopularAccessories = async () => {
    try {
      const productsCollectionRef = collection(db, "Products");
      const q = query(productsCollectionRef, where("category", "==", "accessories"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("No car accessories found.");
        setAccessories([]);
        setLoading(false);
        return;
      }

      const accessoriesList = snapshot.docs.map(doc => {
        const data = doc.data();
        const productImage = Array.isArray(data.images) ? data.images[0] : data.images;
        return {
          id: doc.id,
          ...data,
          image: productImage,
        };
      });

      setAccessories(accessoriesList.slice(0, 3));
    } catch (error) {
      console.error("Error fetching car accessories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularAccessories();
  }, []);

  
  if (accessories.length === 0) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <p className="text-gray-600 dark:text-white">Loading accessories...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-4/5 pt-12">
        <Slide {...properties} transitionDuration={500}>
          {accessories.map((accessory, index) => (
            <div key={accessory.id || index}>
              <div
                style={{
                  ...divStyle,
                  backgroundImage: `url(${accessory.image})`, 
                }}
              >
                {/* Wrap the entire image in a Link component */}
                <Link to={`/detail/${accessory.id}`} className="absolute inset-0 cursor-pointer">
                  {/* Overlay text on the image */}
                  <div className="absolute bottom-4 left-4 text-white text-xl font-bold p-3 rounded">
                    {accessory.name}
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </Slide>
      </div>
    </div>
  );
}

export default Slider;
