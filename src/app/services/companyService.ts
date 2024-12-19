import axios from "axios";

const API_URL = "http://localhost:3001/api/companies";

export const fetchCompanies = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; // Array of { company_id, company_name }
    } catch (error) {
        // @ts-ignore
        console.error("Error fetching companies:", error.message);
        throw new Error("Failed to fetch companies");
    }
};
