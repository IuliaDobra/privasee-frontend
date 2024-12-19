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

    const [propertyFields, setPropertyFields] = useState<Record<string, string>>({});
    const [userOptions, setUserOptions] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const parseProperties = (properties: string) => {
        return properties
            .split(",")
            .map((pair) => pair.split(":"))
            .reduce((acc, [key, value]) => {
                acc[key.trim()] = value.trim();
                return acc;
            }, {} as Record<string, string>);
    };

    const serializeProperties = (properties: Record<string, string>) => {
        return Object.entries(properties)
            .map(([key, value]) => `${key}:${value}`)
            .join(", ");
    };

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
            setIsViewing(isView);
            if (initialData.properties) {
                setPropertyFields(parseProperties(initialData.properties));
            }
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
            setPropertyFields({});
            setIsEditing(false); // Ensure it's not in edit mode
            setIsViewing(false); //ensure it's not in view mode
        }
    }, [initialData, isEdit, isView]);

    useEffect(() => {
        if (initialData?.properties) {
            setPropertyFields(parseProperties(initialData.properties));
        }
    }, [initialData]);

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
// Remove empty key-value pairs
        const filteredProperties = Object.fromEntries(
            Object.entries(propertyFields).filter(([key, value]) => key.trim() && value.trim())
        );

        const serializedProperties = serializeProperties(filteredProperties);
        const updatedQuestion = {
            ...formData,
            properties: serializedProperties,
            updated_at: new Date().toISOString(),
            created_at: formData.created_at || new Date().toISOString(),
        };
        onSave(updatedQuestion);
        onClose();
    };

    const toggleEditMode = () => {
        setIsEditing(true);
        setIsViewing(false);

    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>
                {isViewing && !isEditing
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
                    disabled={isViewing && !isEditing}
                />
                <TextField
                    label="Question Description"
                    name="question_description"
                    fullWidth
                    margin="dense"
                    value={formData.question_description}
                    onChange={handleInputChange}
                    disabled={isViewing && !isEditing}
                />
                <TextField
                    label="Answer"
                    name="answer"
                    fullWidth
                    margin="dense"
                    value={formData.answer}
                    onChange={handleInputChange}
                    disabled={isViewing && !isEditing}
                />

                {/* Company Name */}
                <FormControl fullWidth margin="dense" disabled={isViewing && !isEditing}>
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
                <FormControl fullWidth margin="dense" disabled={isViewing && !isEditing}>
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

                <Box>
                    {Object.entries(propertyFields).map(([key, value], index) => (
                        <Box key={index} display="flex" gap={2} alignItems="center" justifyContent="space-evenly">
                            <TextField
                                label="Key"
                                value={key}
                                fullWidth
                                onChange={(e) => {
                                    const newFields = { ...propertyFields };
                                    const newKey = e.target.value;
                                    delete newFields[key];
                                    newFields[newKey] = value;
                                    setPropertyFields(newFields);
                                }}
                                disabled={isViewing && !isEditing}
                                margin="dense"
                            />
                            <TextField
                                label="Value"
                                value={value}
                                fullWidth
                                onChange={(e) => {
                                    const newFields = { ...propertyFields };
                                    newFields[key] = e.target.value;
                                    setPropertyFields(newFields);
                                }}
                                disabled={isViewing && !isEditing}
                                margin="dense"
                            />
                            {isEditing && (
                                <Button
                                    color="error"
                                    onClick={() => {
                                        const newFields = { ...propertyFields };
                                        delete newFields[key];
                                        setPropertyFields(newFields);
                                    }}
                                    disabled={isViewing && !isEditing}
                                >
                                    Remove
                                </Button>
                            )}
                        </Box>
                    ))}

                    {/* Display "Add Property" button only if appropriate */}
                    {!isViewing && (isEditing || Object.keys(propertyFields).length === 0) && (
                        <Button
                            variant="outlined"
                            onClick={() => setPropertyFields({ ...propertyFields, "": "" })}
                        >
                            Add Property
                        </Button>
                    )}
                </Box>

                {/* Created/Updated Fields - Only Render in Edit or View */}
                {(isEditing || isViewing) && formData.id && (
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
                {isViewing && !isEditing ? (
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
