import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Gallery from "../components/ImageGallery";
import Category_part from "../components/Category_part";
import { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";

export default function ViewMore() {
  const { id } = useParams(); // Get the place ID from the URL
  const [place, setPlace] = useState(null);
  const [image, setImage] = useState(null);
  const [tours, setTours] = useState([]); // Initialize as an empty array
  const [showTours, setShowTours] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [bookedTourGuide, setBookedTourGuide] = useState(null); // State to store the booked tour guide
  const [selectedDate, setSelectedDate] = useState(null); // State for the selected date
  const [updatedPrice, setUpdatedPrice] = useState(null); // State for the updated price
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaceById = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/place/${id}`
        );
        if (response.data && response.data.data) {
          setPlace(response.data.data); // Ensure this matches your API response structure
          setUpdatedPrice(response.data.data.price); // Set the initial price
          console.log("Fetched place:", response.data.data);
        } else {
          console.error("Invalid response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching place:", error);
      }
    };

    fetchPlaceById();
  }, [id]);

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
    // Register locale for date picker
    registerLocale("en-GB", enGB);

    // Set minDate for date picker to prevent selection of past dates
    const today = new Date();
    setSelectedDate(today); // Start with today's date
  }, []);

  const handleAddToTrip = async () => {
    const userData = JSON.parse(window.localStorage.getItem("userData"));
    if (!userData || !userData.token) {
      console.error("User data or token is missing");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date before booking.");
      return;
    }

    if (!bookedTourGuide) {
      alert("Please select a tour guide before booking.");
      return;
    }

    const tourPrice = bookedTourGuide ? bookedTourGuide.price : 0;
    const totalPrice = place.price + tourPrice;

    try {
      const bookingDetails = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/bookings`,
        {
          tour: bookedTourGuide ? bookedTourGuide._id : null,
          places: place ? [place._id] : [], // Ensure places is an array of place IDs
          date: selectedDate,
          price: totalPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      console.log("Booking response:", bookingDetails);
      navigate("/mytrips", { state: place });
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error.response && error.response.status === 403) {
        alert(error.response.data.message);
      } else {
        alert(
          "An error occurred while creating the booking. Please try again."
        );
      }
    }
  };

  const handlePickTourGuide = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/tours`
      );
      const toursData = response.data.data.data || [];

      // Check if place.location exists and is a string
      if (!place || !place.location || typeof place.location !== "string") {
        console.error("Invalid place location:", place.location);
        return;
      }

      const placeLocationLower = place.location.toLowerCase();

      const filteredTours = toursData.filter((tour) => {
        // Check if tour.location exists and is a string
        if (!tour.location || typeof tour.location !== "string") {
          console.error("Invalid tour location:", tour.location);
          return false;
        }
        return tour.location.toLowerCase() === placeLocationLower;
      });

      setTours(filteredTours); // Set the filtered tours to state
      setShowTours(true); // Show the tours
      setIsVisible(true); // Make the tour guide list visible
      console.log("Filtered tours:", filteredTours);
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  const handleBookTourGuide = (tour) => {
    setBookedTourGuide(tour);
    setUpdatedPrice(place.price + tour.price); // Update the price
    setShowTours(false); // Hide the tour guide list
    console.log("Booked tour guide:", tour);
  };

  if (!place) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Nav />
      <div className="viewmore">
        <Category_part
          img={place.img}
          h2={place.name}
          h3={place.location + " , Egypt"}
        />
        <div className="viewmore-body">
          <Gallery imgs={place.images} />
          <div className="viewmore-second">
            <div className="viewmore-second-left visible">
              <h3>Description</h3>
              <p className="viewmore-second-desc">{place.description}</p>
              <p className="viewmore-second-desc">{place.description2}</p>
              <p className="viewmore-second-desc1">{place.description3}</p>
              <div className="viewmore-third visible">
                <span>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    minDate={new Date()} // Prevents selecting past dates
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select a date"
                    className="datepicker-input"
                    locale="en-GB"
                  />

                  <button
                    className="button-28"
                    role="button"
                    onClick={handlePickTourGuide}
                  >
                    Pick a TourGuide
                  </button>
                </span>
                <button
                  className="button-28"
                  role="button"
                  onClick={handleAddToTrip}
                >
                  Add
                </button>
              </div>
            </div>
            <div className="viewmore-second-right">
              <span className="viewmore-second-right-counters">
                <i className="fa-solid fa-location-dot fa-xl"></i> <p>1000</p> |{" "}
                <i className="fa-solid fa-heart fa-xl"></i>{" "}
                <p>{place.favoriteCount}</p>
              </span>
              <span className="viewmore-second-right-season">
                <h4> Recommended Season: </h4>
                <p>{place.season}</p>
                <h4> Price:</h4>
                <p>{updatedPrice}</p>
              </span>
              <span className="viewmore-second-right-safety">
                <h4>Safety Tips:</h4>
                <ul>
                  <li>Stay Aware of Your Surroundings:</li>
                  <li>Stay Hydrated</li>
                  <li>Dress Modestly</li>
                  <li>Beware of Scams</li>
                </ul>
              </span>
              <span className="viewmore-second-right-safety">
                <h4>Tips and Tricks:</h4>
                <ul>
                  <li>Bargain Politely</li>
                  <li>Explore Side Streets</li>
                  <li>Be Prepared to Walk</li>
                  <li>Check Store Hours</li>
                </ul>
              </span>
            </div>
          </div>

          {showTours && (
            <>
              <div className="picktour-overlay"></div>
              <div className={`tour-guide-list ${isVisible ? "scale-in" : ""}`}>
                <i
                  className="fa-solid fa-x fa-xs"
                  onClick={() => {
                    setShowTours(false);
                  }}
                ></i>
                <h3>Select a Tour Guide</h3>
                <div className="filtertour-body">
                  {tours.length > 0 ? (
                    tours.map((tour) => (
                      <React.Fragment key={tour._id}>
                        <div className="filtertour-element">
                          <div>
                            <h4>{tour.name}</h4>
                            <p className="requests-email">{tour.email}</p>
                            <p className="requests-price">
                              Price: <strong>{tour.price} L.E</strong>
                            </p>
                          </div>
                          <div>
                            <h5>Location:</h5>
                            <p className="requests-status">{tour.location}</p>
                          </div>
                          <div className="requests-button">
                            <button onClick={() => handleBookTourGuide(tour)}>
                              Book
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    ))
                  ) : (
                    <p>No tours available</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer name="footer-main" />
    </>
  );
}
