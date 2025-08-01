import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import "./ConfirmationDialog.css"; 

function ConfirmationDialog({ open, onClose, onConfirm, header, message, subject }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: "dialog-paper" }}
    >
      <DialogTitle>{header}</DialogTitle>
      <DialogContent className="dialog-content">
        <div className="content-box">
          <p>
            <strong>Subject:</strong> {subject} 
          </p>
          <p>
            <strong>Message:</strong> {message}
          </p>
        </div>
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} className="cancel-button">
          Cancel
        </Button>
        <Button onClick={onConfirm} className="confirm-button">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;

