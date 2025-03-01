import React from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Category_part from "../components/Category_part";
import CardPlace from "../components/CardPlace";
import culturalData from "../data/places.json"; // Assuming your data file is named culturalData.js
import { Scroll } from "../func/Scroll";
import ScreenSize from "../func/ScreenSize";
import FloatNav from "../components/Float-nav";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Cultural() {
  const isMobile = ScreenSize();
  const isScrolled = Scroll(250);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/place`
        );
        const culturalPLaces = response.data.filter(
          (place) => place.tourism == "cultural"
        );
        console.log("places:", culturalPLaces);
        setFilteredData(culturalPLaces); // Initialize filteredData with all places
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
            img="culver.jpg"
            h2="IMMERSE IN EGYPT' S CULTURAL RICHES!"
            h3="Your Passport to Cultural Exploration."
          />
        ) : (
          <Category_part
            img="cultural.jpg"
            h2="IMMERSE IN EGYPT' S CULTURAL RICHES!"
            h3="Your Passport to Cultural Exploration."
          />
        )}
        <div className="rec-hist-part">
          <h2>Recommended Places</h2>
          <div className="cards-rec-hist">
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
