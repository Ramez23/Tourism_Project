import React, { useState, useEffect } from "react";
import Category_part from "../components/Category_part";
import CardPlace from "../components/CardPlace";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Scroll } from "../func/Scroll";
import ScreenSize from "../func/ScreenSize";
import FloatNav from "../components/Float-nav";
import axios from "axios";

// Import the data
import data from "../data/places.json"; // Assuming the data is stored in a JSON file

export default function Medical() {
  const isMobile = ScreenSize();
  const [filteredData, setFilteredData] = useState([]);
  const isScrolled = Scroll(250);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/place`
        );
        const medicalPlaces = response.data.filter(
          (place) => place.tourism == "medical"
        );
        setFilteredData(medicalPlaces); // Initialize filteredData with all places
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    fetchPlaces();
  }, []);

  return (
    <>
      {isScrolled ? <FloatNav /> : <Nav />}
      <div className="hist-main">
        {isMobile ? (
          <Category_part
            img="mediver.jpg"
            h2="EXPLORE EGYPT'S MEDICAL TOURISM"
            h3="Discover Egypt's top-quality medical facilities amidst historic and picturesque surroundings."
          />
        ) : (
          <Category_part
            img="medi.jpg"
            h2="EXPLORE EGYPT'S MEDICAL TOURISM"
            h3="Discover Egypt's top-quality medical facilities amidst historic and picturesque surroundings."
          />
        )}

        <div className="rec-hist-part">
          <h2>Recommended Places</h2>
          <div className="cards-rec-hist">
            {/* Map over the medicalData array and render CardPlace components */}
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((place, index) => (
                <CardPlace
                  key={index}
                  place={place} // Pass the whole place object to CardPlace
                />
              ))
            ) : (
              <p>No places found.</p>
            )}
          </div>
        </div>
      </div>
      <Footer name="footer-main" />
    </>
  );
}
