import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography, IconButton,
} from "@mui/material";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";

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
            <DialogTitle display="flex" justifyContent="space-between" alignItems="center" gap={2} sx={{ padding: "20px" }}>
                {title}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>{description}</Typography>
            </DialogContent>
            <DialogActions sx={{paddingBottom: "20px", paddingRight: "20px"}}>
                <Button onClick={onClose} color="primary" variant="outlined">
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
