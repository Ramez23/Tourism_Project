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

export default function Adventure() {
  const isMobile = ScreenSize();
  // Filter the data to get only the places with adventure tourism
  const isScrolled = Scroll(250);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/place`
        );
        const adventurePlaces = response.data.filter(
          (place) => place.tourism == "adventure"
        );
        console.log(adventurePlaces.name);
        setFilteredData(adventurePlaces); // Initialize filteredData with all places
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
            img="advver.jpg"
            h2="DISCOVER EGYPT' S ADVENTURE THRILLS!"
            h3="Your Gateway to Unforgettable Experiences."
          />
        ) : (
          <Category_part
            img="adventure.jpg"
            h2="DISCOVER EGYPT' S ADVENTURE THRILLS!"
            h3="Your Gateway to Unforgettable Experiences."
          />
        )}
        <div className="rec-hist-part">
          <h2>Recommended Places</h2>
          <div className="cards-rec-hist">
            {/* Map through the filtered adventure places and render CardPlace components */}
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
