import axios from "axios";

const API_URL = "http://localhost:3001/api/users";

export const fetchUsers = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; // Array of user emails
    } catch (error) {
        // @ts-ignore
        console.error("Error fetching users:", error.message);
        throw new Error("Failed to fetch users");
    }
};

export const getCurrentUser = () => {
    return "me@me.com";
};
