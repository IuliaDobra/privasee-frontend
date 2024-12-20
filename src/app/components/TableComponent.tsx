import React, {useEffect, useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    IconButton,
    Box,
    Button,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Typography,
    TextField,
    Divider,
} from "@mui/material";
import {Visibility, Edit, Delete, Add} from "@mui/icons-material";
import QuestionDialog from "./QuestionDialog";
import ConfirmDialog from "./ConfirmDialog";
import { formatDate } from "../utils/dateUtils";
import { bulkReassignQuestions, deleteQuestion, fetchQuestions, saveQuestion } from '../services/questionService'
import { fetchUsers } from '../services/userService'
import {QuestionData} from "../types/DataTypes";

const TableComponent: React.FC = () => {
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // State for filters
    const [assignedTo, setAssignedTo] = useState("");
    const [propertyKey, setPropertyKey] = useState("");
    const [propertyValue, setPropertyValue] = useState("");

    // Data state
    const [data, setData] = useState<QuestionData[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Bulk reassign
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [assignee, setAssignee] = useState("");

    // States for dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<QuestionData | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isView, setIsView] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);


    const loadData = async () => {
        setLoading(true);
        try {
            const [questionsResponse, usersResponse] = await Promise.all([
                fetchQuestions({ assignedTo, propertyKey, propertyValue }), // Pass filters
                fetchUsers(),
            ]);
            setData(questionsResponse.records);
            setUsers(usersResponse);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [assignedTo, propertyKey, propertyValue]);

    useEffect(() => {
        loadData();
    }, []);

    // Handle row selection
    const handleRowSelect = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedRows(data.map((row) => row.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleBulkReassign = async () => {
        if (!assignee) return alert("Please select a user to reassign questions.");
        try {
            await bulkReassignQuestions(selectedRows, assignee);
            setSelectedRows([]); // Clear selection
            loadData(); // Reload data
        } catch (error) {
            console.error("Bulk reassign failed:", error);
        }
    };

    const handleChangePage = (_: React.MouseEvent | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    // Paginated data slice
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleSave = async (newQuestion: QuestionData) => {
        await saveQuestion(newQuestion);
        setDialogOpen(false);
        loadData();
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deleteQuestion(deleteId);
            setConfirmDialogOpen(false);
            loadData();
        }
    };

    return (
        <Box sx={{ overflow: "auto", padding: "20px", backgroundColor: "#fff"}}>
            <Box mb={2} display="flex" flexDirection="row" gap={2} >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setDialogData(null);
                        setIsEdit(false);
                        setIsView(false);
                        setDialogOpen(true);
                    }}
                >
                    <Add/> Create New Question
                </Button>

                <Divider orientation="vertical" variant="middle" flexItem/>

                {/* Assigned User Filter */}
                <FormControl style={{ minWidth: 200 }}>
                    <InputLabel>Filter by Assigned User</InputLabel>
                    <Select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                    >
                        {users.map((user) => (
                            <MenuItem key={user} value={user}>
                                {user}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Custom Properties Filter */}
                <TextField
                    label="Property Key"
                    value={propertyKey}
                    onChange={(e) => setPropertyKey(e.target.value)}
                />
                <TextField
                    label="Property Value"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                />

                {/* Reset Filters */}
                <Button
                    variant="outlined"
                    onClick={() => {
                        setAssignedTo("");
                        setPropertyKey("");
                        setPropertyValue("");
                    }}
                >
                    Reset Filters
                </Button>

                {selectedRows.length > 0 && (
                    <Box display="flex" gap={2}>
                        <Divider orientation="vertical" variant={"middle"} flexItem/>
                        <FormControl>
                            <InputLabel>Reassign To</InputLabel>
                            <Select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                style={{ width: 200 }}
                            >
                                {users.map((user) => (
                                    <MenuItem key={user} value={user}>
                                        {user}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBulkReassign}
                        >
                            Reassign Selected
                        </Button>
                    </Box>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.length < data.length
                                    }
                                    checked={data.length > 0 && selectedRows.length === data.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>ID</TableCell>
                            <TableCell>Question</TableCell>
                            <TableCell>Answer</TableCell>
                            <TableCell>Properties</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Company ID</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Updated By</TableCell>
                            <TableCell>Updated At</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={13} align="center">
                                    <CircularProgress />
                                    <Typography variant="h6" marginLeft={2}>
                                        Loading data...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedRows.includes(row.id)}
                                        onChange={() => handleRowSelect(row.id)}
                                    />
                                </TableCell>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.question}</TableCell>
                                <TableCell>{row.answer}</TableCell>
                                <TableCell>{row.properties}</TableCell>
                                <TableCell>{row.assigned_to}</TableCell>
                                <TableCell>{row.company_name}</TableCell>
                                <TableCell>{row.company_id}</TableCell>
                                <TableCell>{row.created_by}</TableCell>
                                <TableCell>{formatDate(row.created_at)}</TableCell>
                                <TableCell>{row.updated_by}</TableCell>
                                <TableCell>{formatDate(row.updated_at)}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            setDialogData(row);
                                            setIsView(true);
                                            setIsEdit(false);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <Visibility />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            setDialogData(row);
                                            setIsEdit(true);
                                            setIsView(false);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            setDeleteId(row.id);
                                            setConfirmDialogOpen(true);
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Dialogs */}
            <QuestionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
                initialData={dialogData}
                isEdit={isEdit}
                isView={isView}
            />
            <ConfirmDialog
                open={confirmDialogOpen}
                title="Confirm Delete"
                description="Are you sure you want to delete this question?"
                onConfirm={handleDelete}
                onClose={() => setConfirmDialogOpen(false)}
            />
        </Box>
    );
};

export default TableComponent;