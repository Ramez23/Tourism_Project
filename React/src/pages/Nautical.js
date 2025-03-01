import React from "react";
import Category_part from "../components/Category_part";
import CardPlace from "../components/CardPlace";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import data from "../data/places.json";
import { Scroll } from "../func/Scroll";
import ScreenSize from "../func/ScreenSize";
import FloatNav from "../components/Float-nav";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Nautical() {
  const isMobile = ScreenSize();
  // Filter the data to extract only the places related to religious tourism
  const [filteredData, setFilteredData] = useState([]);
  const isScrolled = Scroll(250);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/place`
        );
        const nauticalPlaces = response.data.filter(
          (place) => place.tourism == "nautical"
        );
        setFilteredData(nauticalPlaces); // Initialize filteredData with all places
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
            img="nautver.jpg"
            h2="EXPLORE EGYPT'S NAUTICAL TOURISM"
            h3="Discover Egypt's coastal treasures: pristine beaches, vibrant coral reefs, and ancient ports."
          />
        ) : (
          <Category_part
            img="naut.jpg"
            h2="EXPLORE EGYPT'S NAUTICAL TOURISM"
            h3="Discover Egypt's coastal treasures: pristine beaches, vibrant coral reefs, and ancient ports."
          />
        )}

        <div className="rec-hist-part">
          <h2>Recommended Places</h2>
          <div className="cards-rec-hist">
            {/* Map over the nauticalPlaces array and render CardPlace components */}
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
