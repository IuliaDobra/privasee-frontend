import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    description: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                         open,
                                                         title = "Confirm Action",
                                                         description,
                                                         onConfirm,
                                                         onClose,
                                                     }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{description}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" variant="outlined">
                    No
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
