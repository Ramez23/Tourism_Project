import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [inputs, setInputs] = useState({
    token: "",
    password: "",
    passwordConfirm: "",
  });
  const navigate = useNavigate(); // Replacing useHistory with useNavigate

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/users/resetPassword/${inputs.token}`,
        {
          password: inputs.password,
          passwordConfirm: inputs.passwordConfirm,
        }
      );
      alert(
        "Password successfully reset!\nPlease Login with your new passwoed"
      );
      navigate("/"); // Navigate to login after success
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password.");
    }
  };

  return (
    <>
      <div className="reset-password-form signup-popup show">
        <form onSubmit={handleSubmit}>
          <h3>Reset Your Password</h3>
          <input
            type="text"
            name="token"
            placeholder="Enter your token"
            value={inputs.token}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="New password"
            value={inputs.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="passwordConfirm"
            placeholder="Confirm new password"
            value={inputs.passwordConfirm}
            onChange={handleChange}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      </div>
      <div className="password-overlay"></div>
    </>
  );
};

export default ResetPassword;
