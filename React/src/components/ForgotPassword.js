import axios from "axios";
// Import the ResetPassword component if needed directly or trigger via routes

const handleForgotPassword = async (email, setResetMailSent) => {
  if (!email) {
    alert("User email is not available");
    return;
  }

  try {
    await axios.post(`${process.env.REACT_APP_BASE_URL}/users/forgotPassword`, {
      email,
    });
    alert("Password reset email sent!");
    setResetMailSent(true); // Optional: Handle UI changes after mail sent
  } catch (error) {
    console.error("Error sending password reset email:", error);
    alert("Failed to send password reset email.");
  }
};

function ForgotPassword({
  setPasswordState,
  formData,
  setFormData,
  setResetMailState,
}) {
  return (
    <>
      <div className="password-popup show">
        <span className="password-exit" onClick={() => setPasswordState(false)}>
          <i className="fa-solid fa-x"></i>
        </span>
        <div className="password-body">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleForgotPassword(formData.email, setResetMailState);
              setPasswordState(false);
            }}
          >
            <h3>Please Enter Your Email!</h3>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <button type="submit">Send Mail</button>
          </form>
        </div>
      </div>
      <div className="password-overlay"></div>
    </>
  );
}

export default ForgotPassword;
