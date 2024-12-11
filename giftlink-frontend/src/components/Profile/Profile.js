import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { urlConfig } from "../../config";
import { useAppContext } from "../../context/AuthContext";

const Profile = () => {
    const [userDetails, setUserDetails] = useState({});
    const [updatedDetails, setUpdatedDetails] = useState({});
    const [changed, setChanged] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();
    const { setUserName } = useAppContext();

    useEffect(() => {
        const authtoken = sessionStorage.getItem("auth-token");
        if (!authtoken) {
            navigate("/app/login");
        } else {
            fetchUserProfile();
        }
    }, [navigate]);

    const fetchUserProfile = () => {
        const name = sessionStorage.getItem("name");
        const email = sessionStorage.getItem("email");

        if (name || email) {
            const storedUserDetails = {
                name,
                email,
            };
            setUserDetails(storedUserDetails);
            setUpdatedDetails(storedUserDetails);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleInputChange = (e) => {
        setUpdatedDetails({
            ...updatedDetails,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!updatedDetails.name.trim()) {
            setChanged("Name cannot be empty.");
            return;
        }

        setIsSubmitting(true);

        try {
            const authtoken = sessionStorage.getItem("auth-token");
            const email = sessionStorage.getItem("email");

            if (!authtoken || !email) {
                navigate("/app/login");
                return;
            }

            const payload = { ...updatedDetails };
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/update`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authtoken}`,
                    "Content-Type": "application/json",
                    Email: email,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setUserName(updatedDetails.name);
                sessionStorage.setItem("name", updatedDetails.name);
                setUserDetails(updatedDetails);
                setEditMode(false);
                setChanged("Name Changed Successfully!");
                setTimeout(() => {
                    setChanged("");
                }, 2000);
            } else if (response.status === 401) {
                sessionStorage.clear();
                navigate("/app/login");
            } else {
                setChanged("Failed to update profile. Please try again.");
            }
        } catch (error) {
            setChanged("Something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-container">
            {editMode ? (
                <form onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={userDetails.email}
                            disabled
                        />
                    </label>
                    <label>
                        Name
                        <input
                            type="text"
                            name="name"
                            value={updatedDetails.name}
                            onChange={handleInputChange}
                            aria-label="Edit Name"
                        />
                    </label>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save"}
                    </button>
                </form>
            ) : (
                <div className="profile-details">
                    <h1>Hi, {userDetails.name}</h1>
                    <p>
                        <b>Email:</b> {userDetails.email}
                    </p>
                    <button onClick={handleEdit}>Edit</button>
                    <span
                        style={{
                            color: "green",
                            height: ".5cm",
                            display: "block",
                            fontStyle: "italic",
                            fontSize: "12px",
                        }}
                    >
                        {changed}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Profile;
