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
    Button, TablePagination, FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
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

    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [assignee, setAssignee] = useState("");
    const [data, setData] = useState<QuestionData[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
                fetchQuestions(),
                fetchUsers(),
            ]);
            setData(questionsResponse.records);
            setUsers(usersResponse); // Populate users
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

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


    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh" // Full-screen loader
            >
                <CircularProgress />
                <Typography variant="h6" marginLeft={2}>
                    Loading data...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ overflow: "auto", padding: "20px", backgroundColor: "#fff"}}>
            <Box mb={2} display="flex" flexDirection="row" justifyContent="space-between">
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
                    Create New Question
                </Button>

                {selectedRows.length > 0 && (
                    <Box display="flex" gap={2}>
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
                        {paginatedData.map((row) => (
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
                        ))}
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