import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import axios from "axios";

export default function ChangePassword({ email }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { user } = useUser();

  const validateForm = () => {
    const newErrors = {};
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long.";
    }
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return; // Stop the function if validation fails
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/users/updateMyPassword`,
        {
          passwordCurrent: currentPassword,
          password: newPassword,
          passwordConfirm: confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password.\nCurrent Password is not right");
    }
  };

  return (
    <div className="change-main">
      <label>
        <p>Current Password:</p>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        {errors.currentPassword && (
          <div style={{ color: "red" }}>{errors.currentPassword}</div>
        )}
      </label>
      <label>
        <p>New Password:</p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {errors.newPassword && (
          <div style={{ color: "red" }}>{errors.newPassword}</div>
        )}
      </label>
      <label>
        <p>Re-write New Password:</p>
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        {errors.confirmNewPassword && (
          <div style={{ color: "red" }}>{errors.confirmNewPassword}</div>
        )}
      </label>
      <button onClick={handleChangePassword}>Change Password</button>
    </div>
  );
}
