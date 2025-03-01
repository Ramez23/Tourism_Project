import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ScreenSize from "../func/ScreenSize";
import axios from "axios";

export default function CardPlace({ place }) {
  const [image, setImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = ScreenSize();

  useEffect(() => {
    if (place && place.img) {
      const loadImage = async () => {
        try {
          const imgModule = await import(`../imgs/${place.img}`);
          setImage(imgModule.default);
        } catch (error) {
          console.error("Error loading image:", error);
        }
      };
      loadImage();
    }
  }, [place]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const userData = JSON.parse(window.localStorage.getItem("userData")); // Get the token from local storage
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/favorites`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
            withCredentials: true, // Ensure cookies are sent with the request
          }
        );

        const favoritePlaces = response.data.data.favorites;
        const isFav = favoritePlaces.some(
          (favPlace) => favPlace._id === place._id
        );
        setIsFavorite(isFav); // Update the favorite status
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    if (place) {
      checkIfFavorite();
    }
  }, [place]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAddToFavorites = async () => {
    try {
      const userData = JSON.parse(window.localStorage.getItem("userData")); // Get the token from local storage
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/favorites`,
        {
          placeId: place._id,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );
      if (response.data.status === "success") {
        setIsFavorite(true); // Update the favorite status
        console.log("Place added to favorites");
        console.log("place:", response);
      }
    } catch (error) {
      console.error("Error adding place to favorites:", error);
    }
  };

  if (!place) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className={`card-rec-hist ${isVisible ? "slide-in-up" : ""}`}>
        {image && <img src={image} alt={place.img} />}
        <span className="card-rec-hist-writings">
          <h4>{place.name}</h4>
          {isMobile ? <p>View More For Details</p> : <p>{place.description}</p>}
          <span className="card-buttons">
            <i
              className={`fa-solid fa-heart fa-lg ${
                isFavorite ? "favorite" : ""
              }`}
              onClick={handleAddToFavorites}
              style={{ cursor: "pointer" }}
            ></i>
          </span>
        </span>
        <span className="button">
          <Link to={`/viewmore/${place._id}`}>View More</Link>
        </span>
      </div>
    </>
  );
}
