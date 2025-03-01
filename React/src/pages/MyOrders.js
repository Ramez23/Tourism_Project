import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import axios from "axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [places, setPlaces] = useState({});
  const [users, setUsers] = useState({});
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      const tourData = JSON.parse(
        window.localStorage.getItem("userData") || "{}"
      );
      if (!tourData.token) {
        console.error("Authentication token is missing.");
        return;
      }

      try {
        const bookingResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/bookings/tour/${tourData.data.tour._id}`,
          { headers: { Authorization: `Bearer ${tourData.token}` } }
        );

        const allBookings = bookingResponse.data.data.bookings || [];
        setOrders(allBookings);

        // Extract user data directly from the bookings
        const newUserDetails = {};
        allBookings.forEach((booking) => {
          if (booking.user) {
            newUserDetails[booking.user._id] = booking.user;
          }
        });
        setUsers(newUserDetails);

        // Extract place data
        const newPlaces = {};
        allBookings.forEach((booking) => {
          booking.places.forEach((place) => {
            newPlaces[place._id] = place;
          });
        });
        setPlaces(newPlaces);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  const handleAcceptBooking = async (bookingId) => {
    const tourData = JSON.parse(
      window.localStorage.getItem("userData") || "{}"
    );

    setProcessing((prev) => ({ ...prev, [bookingId]: true }));

    try {
      await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/bookings/${bookingId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${tourData.token}` } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === bookingId ? { ...order, status: "accepted" } : order
        )
      );
    } catch (error) {
      console.error("Failed to accept booking:", error);
      setProcessing((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    const tourData = JSON.parse(
      window.localStorage.getItem("userData") || "{}"
    );

    setProcessing((prev) => ({ ...prev, [bookingId]: true }));

    try {
      await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/bookings/${bookingId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${tourData.token}` } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === bookingId ? { ...order, status: "declined" } : order
        )
      );
    } catch (error) {
      console.error("Failed to decline booking:", error);
      setProcessing((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleFinishBooking = async (bookingId) => {
    const tourData = JSON.parse(
      window.localStorage.getItem("userData") || "{}"
    );

    try {
      await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/bookings/${bookingId}/finish`,
        {},
        { headers: { Authorization: `Bearer ${tourData.token}` } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === bookingId ? { ...order, status: "finished" } : order
        )
      );
    } catch (error) {
      console.error("Failed to finish booking:", error);
    }
  };

  return (
    <>
      <Nav />
      <div className="myorders">
        <h2>My Orders</h2>
        <div className="myorders-body">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="myorders-element">
                <div className="myorders-element-info">
                  <h3>
                    Booking ID: <p>{order._id}</p>
                  </h3>
                  <div className="myorders-element-info-user">
                    {users[order.user._id] ? (
                      <p>
                        <strong>Username:</strong> {users[order.user._id].name}
                      </p>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Price:</strong> {order.price} L.E
                  </p>
                  <div className="myorders-element-info-place">
                    <ul>
                      {order.places.map((place) => (
                        <>
                          <h4>Place:</h4>

                          <li key={place._id}>
                            {places[place._id]
                              ? places[place._id].name
                              : "Loading..."}
                          </li>
                        </>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="orderdiv-status">
                  <h5>Status:</h5>
                  <p className="order-status">{order.status}</p>
                </div>
                <div className="requests-button">
                  {order.status === "confirmed" ? (
                    <>
                      <button
                        onClick={() => {
                          handleFinishBooking(order._id);
                        }}
                      >
                        Done
                      </button>
                    </>
                  ) : order.status === "finished" ? null : (
                    <>
                      <button
                        onClick={() => handleAcceptBooking(order._id)}
                        disabled={processing[order._id]}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineBooking(order._id)}
                        disabled={processing[order._id]}
                      >
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="orders-off">
              <p>No orders found.</p>
            </div>
          )}
        </div>
      </div>
      <Footer name="footer-main" />
    </>
  );
}
