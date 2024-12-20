import axios from "axios";
import {QuestionData} from "../types/DataTypes";
import {getCurrentUser} from "./userService";

const API_URL = "http://localhost:3001/api/questions";

export const fetchQuestions = async (filters = {}) => {
    try {
        console.log("Requesting filtered data with filters:", filters);
        const response = await axios.get(API_URL, { params: filters }); // Add filters as query params
        console.log("Data received:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching questions:", error.message);
        if (error.response) {
            console.error("Server Response:", error.response.data);
        }
        throw error;
    }
};


export const deleteQuestion = async (id: string) => {
    return await axios.delete(`${API_URL}/${id}`);
};

// Save (Create or Update) a question
export const saveQuestion = async (question: QuestionData) => {
    try {
        const payload = { ...question, updated_by: getCurrentUser() };

        // Remove the "id" field for CREATE (POST)
        if (!question.id) {
            delete payload.id;
        }

        if (question.id) {
            // Update an existing record
            return await axios.put(`${API_URL}/${question.id}`, payload);
        } else {
            // Create a new record
            return await axios.post(API_URL, {...payload, created_by: getCurrentUser()});
        }
    } catch (error) {
        // @ts-ignore
        console.error("Error saving question:", error.message);
        throw error;
    }
};

export const bulkReassignQuestions = async (ids: string[], assigned_to: string) => {
    return await axios.put(`${API_URL}/bulk-reassign`, {
        ids,
        assigned_to,
        updated_by: getCurrentUser(),
    });
};



