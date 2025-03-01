import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function Requests() {
  const [pendingTours, setPendingTours] = useState([]);
  const [cancellationRequests, setCancellationRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = localStorage.getItem("userData");
        if (!storedData) {
          console.error("No user data found in localStorage.");
          return;
        }

        const parsedData = JSON.parse(storedData);
        if (!parsedData.token || !parsedData.data || !parsedData.data.user) {
          console.error("Invalid user data structure in localStorage.");
          return;
        }

        const {
          token,
          data: { user },
        } = parsedData;

        if (user.role !== "admin") {
          console.error(
            "Unauthorized: Only admins can fetch pending tours and cancellation requests"
          );
          return;
        }

        const [toursResponse, cancellationsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/tours/pending-tours`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/cancellation-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPendingTours(toursResponse.data.data.pendingTours);
        setCancellationRequests(cancellationsResponse.data.data.requests);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleApproveTour = async (tourId) => {
    try {
      const storedData = localStorage.getItem("userData");
      if (!storedData) {
        console.error("No user data found in localStorage.");
        return;
      }

      const parsedData = JSON.parse(storedData);
      const { token } = parsedData;

      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/tours/approve-tour/${tourId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setPendingTours(
          pendingTours.map((tour) =>
            tour._id === tourId ? { ...tour, approved: true } : tour
          )
        );
      }
    } catch (error) {
      console.error("Error approving tour:", error);
    }
  };

  const handleDeclineTour = async (tourId) => {
    try {
      const storedData = localStorage.getItem("userData");
      if (!storedData) {
        console.error("No user data found in localStorage.");
        return;
      }

      const parsedData = JSON.parse(storedData);
      const { token } = parsedData;

      await axios.delete(`${process.env.REACT_APP_BASE_URL}/tours/${tourId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPendingTours(pendingTours.filter((tour) => tour._id !== tourId));
    } catch (error) {
      console.error("Error declining tour:", error);
    }
  };

  const handleApproveCancellation = async (requestId) => {
    try {
      const storedData = localStorage.getItem("userData");
      if (!storedData) {
        console.error("No user data found in localStorage.");
        return;
      }

      const parsedData = JSON.parse(storedData);
      const { token } = parsedData;

      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/cancellation-requests/${requestId}`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setCancellationRequests(
          cancellationRequests.map((request) =>
            request._id === requestId
              ? { ...request, status: "approved" }
              : request
          )
        );
      }
    } catch (error) {
      console.error("Error approving cancellation request:", error);
    }
  };

  const handleDeclineCancellation = async (requestId) => {
    try {
      const storedData = localStorage.getItem("userData");
      if (!storedData) {
        console.error("No user data found in localStorage.");
        return;
      }

      const parsedData = JSON.parse(storedData);
      const { token } = parsedData;

      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/cancellation-requests/${requestId}`,
        { status: "rejected" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setCancellationRequests(
          cancellationRequests.map((request) =>
            request._id === requestId
              ? { ...request, status: "rejected" }
              : request
          )
        );
      }
    } catch (error) {
      console.error("Error declining cancellation request:", error);
    }
  };

  return (
    <>
      <Nav />
      <div className="requests">
        <h2>My Requests</h2>
        <div className="requests-body">
          <h3>Pending Tours</h3>
          {pendingTours.length > 0 ? (
            pendingTours.map((tour) => (
              <React.Fragment key={tour._id}>
                <div className="requests-element">
                  <div>
                    {tour.imageCover && (
                      <img
                        src={`http://localhost:3000/img/tours/${tour.imageCover}`}
                        alt={`${tour.name}`}
                        style={{ width: "150px", height: "auto" }}
                      />
                    )}
                    <h4>{tour.name}</h4>
                    <p className="requests-email">{tour.email}</p>
                    <p className="requests-price">
                      Price: <strong>{tour.price} L.E</strong>
                    </p>
                  </div>
                  <div>
                    <h5>Approved:</h5>
                    <p className="requests-status">
                      {!tour.approved ? "Pending" : "Approved"}
                    </p>
                  </div>
                  <div className="requests-button">
                    <button
                      onClick={() => handleApproveTour(tour._id)}
                      disabled={tour.approved}
                      style={{ opacity: tour.approved ? 0.5 : 1 }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeclineTour(tour._id)}
                      disabled={tour.approved}
                      style={{ opacity: tour.approved ? 0.5 : 1 }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <p>No pending tours found.</p>
          )}
        </div>
        <div className="cancel-requests">
          <h3>Cancellation Requests</h3>
          {cancellationRequests.length > 0 ? (
            cancellationRequests.map((request) => (
              <React.Fragment key={request._id}>
                <div className="cancel-element">
                  <div>
                    <h4>
                      Booking ID:{" "}
                      {request.booking ? request.booking._id : "N/A"}
                    </h4>
                    <p>
                      User:{" "}
                      {request.user
                        ? `${request.user.name} (${request.user.email})`
                        : "N/A"}
                    </p>
                    <p>Reason: {request.reason}</p>
                  </div>
                  <div>
                    <h5>Status:</h5>
                    <p className="requests-status">{request.status}</p>
                  </div>
                  <div className="requests-button">
                    <button
                      onClick={() => handleApproveCancellation(request._id)}
                      disabled={
                        request.status === "approved" ||
                        request.status === "rejected"
                      }
                      style={{
                        opacity: request.status === "approved" ? 0.5 : 1,
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeclineCancellation(request._id)}
                      disabled={
                        request.status === "approved" ||
                        request.status === "rejected"
                      }
                      style={{
                        opacity: request.status === "rejected" ? 0.5 : 1,
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <p>No cancellation requests found.</p>
          )}
        </div>
      </div>
      <Footer name="footer-main" />
    </>
  );
}
