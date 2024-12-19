import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
} from "@mui/material";
import { fetchCompanies } from "../services/companyService";
import { fetchUsers } from "../services/userService";
import { formatDate } from "../utils/dateUtils"; // For date formatting

interface QuestionDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (question: any) => void;
    initialData?: any;
    isEdit?: boolean;
    isView?: boolean;
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({
                                                           open,
                                                           onClose,
                                                           onSave,
                                                           initialData,
                                                           isEdit = false,
                                                           isView = false,
                                                       }) => {
    const [formData, setFormData] = useState({
        id: "",
        question: "",
        question_description: "",
        answer: "",
        properties: "",
        assigned_to: "",
        company_name: "",
        company_id: "",
        updated_by: "",
        created_by: "",
        created_at: "",
        updated_at: "",
    });

    const [companyOptions, setCompanyOptions] = useState<
        { company_id: string; company_name: string }[]
    >([]);
    const [userOptions, setUserOptions] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [companies, users] = await Promise.all([fetchCompanies(), fetchUsers()]);
                setCompanyOptions(companies);
                setUserOptions(users);
            } catch (error) {
                console.error("Error fetching dropdown data:", error.message);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(initialData);
            setIsEditing(isEdit);
        } else {
            setFormData({
                id: "",
                properties: "",
                question: "",
                question_description: "",
                answer: "",
                assigned_to: "",
                company_name: "",
                company_id: "",
                updated_by: "",
                created_by: "",
                created_at: "",
                updated_at: "",
            });
            setIsEditing(false); // Ensure it's not in edit mode
        }
    }, [initialData, isEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name!]: value });
    };

    const handleCompanyChange = (e: any) => {
        const selectedCompany = companyOptions.find((company) => company.company_name === e.target.value);
        if (selectedCompany) {
            setFormData({
                ...formData,
                company_name: selectedCompany.company_name,
                company_id: selectedCompany.company_id,
            });
        }
    };

    const handleSave = () => {
        const updatedQuestion = {
            ...formData,
            updated_at: new Date().toISOString(),
            created_at: formData.created_at || new Date().toISOString(),
        };
        onSave(updatedQuestion);
        onClose();
    };

    const toggleEditMode = () => setIsEditing(true);

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>
                {isView && !isEditing
                    ? "View Question"
                    : isEditing
                        ? "Edit Question"
                        : "Create New Question"}
            </DialogTitle>
            <DialogContent>
                {/* Question and Description */}
                <TextField
                    label="Question"
                    name="question"
                    fullWidth
                    margin="dense"
                    value={formData.question}
                    onChange={handleInputChange}
                    disabled={isView && !isEditing}
                />
                <TextField
                    label="Question Description"
                    name="question_description"
                    fullWidth
                    margin="dense"
                    value={formData.question_description}
                    onChange={handleInputChange}
                    disabled={isView && !isEditing}
                />
                <TextField
                    label="Answer"
                    name="answer"
                    fullWidth
                    margin="dense"
                    value={formData.answer}
                    onChange={handleInputChange}
                    disabled={isView && !isEditing}
                />

                {/* Company Name */}
                <FormControl fullWidth margin="dense" disabled={isView && !isEditing}>
                    <InputLabel>Company Name</InputLabel>
                    <Select
                        value={formData.company_name}
                        onChange={handleCompanyChange}
                        name="company_name"
                        label="Company Name"
                    >
                        {companyOptions.map((company) => (
                            <MenuItem key={company.company_id} value={company.company_name}>
                                {company.company_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Assigned To */}
                <FormControl fullWidth margin="dense" disabled={isView && !isEditing}>
                    <InputLabel>Assigned To</InputLabel>
                    <Select
                        value={formData.assigned_to}
                        onChange={handleInputChange}
                        name="assigned_to"
                        label="Assigned To"
                    >
                        {userOptions.map((user) => (
                            <MenuItem key={user} value={user}>
                                {user}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Created/Updated Fields - Only Render in Edit or View */}
                {(isEdit || isView) && formData.id && (
                    <>
                        <Box display="flex" gap={2} marginTop={2}>
                            <TextField
                                label="Created By"
                                name="created_by"
                                fullWidth
                                margin="dense"
                                value={formData.created_by}
                                disabled
                            />
                            <TextField
                                label="Created At"
                                name="created_at"
                                fullWidth
                                margin="dense"
                                value={formatDate(formData.created_at)}
                                disabled
                            />
                        </Box>

                        <Box display="flex" gap={2} marginTop={2}>
                            <TextField
                                label="Updated By"
                                name="updated_by"
                                fullWidth
                                margin="dense"
                                value={formData.updated_by}
                                disabled
                            />
                            <TextField
                                label="Updated At"
                                name="updated_at"
                                fullWidth
                                margin="dense"
                                value={formatDate(formData.updated_at)}
                                disabled
                            />
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                {isView && !isEditing ? (
                    <Button onClick={toggleEditMode} color="primary" variant="contained">
                        Switch to Edit
                    </Button>
                ) : (
                    <Button onClick={handleSave} color="primary" variant="contained">
                        Save
                    </Button>
                )}
                <Button onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuestionDialog;
