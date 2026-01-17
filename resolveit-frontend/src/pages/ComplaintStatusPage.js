// src/pages/ComplaintStatusPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Chip, List, ListItem, ListItemText,
  ListItemIcon, CircularProgress, Alert, Divider
} from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const statusColors = {
  "New": { color: "warning", label: "New" },
  "In Progress": { color: "info", label: "In Progress" },
  "Resolved": { color: "success", label: "Resolved" },
  "Closed": { color: "default", label: "Closed" }
};

export default function ComplaintStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, [id]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/complaints/${id}/status`);
      if (!response.ok) throw new Error("Complaint not found");
      const data = await response.json();
      setStatusData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}. <a href="/complaint" style={{ color: "inherit", textDecoration: "underline" }}>Submit new complaint</a>
      </Alert>
    );
  }

  const currentStatusConfig = statusColors[statusData.currentStatus] || statusColors["New"];

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Complaint #{statusData.complaintId}
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          {statusData.title}
        </Typography>

        {/* 🔥 BIG STATUS BOX */}
        <Box sx={{ textAlign: "center", mt: 3, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={currentStatusConfig.label || statusData.currentStatus}
            color={currentStatusConfig.color}
            size="large"
            sx={{ fontSize: "1.2rem", height: 50, mb: 2 }}
          />
          <Typography variant="h5" color="text.secondary">
            Current Status
          </Typography>
        </Box>
      </Paper>

      {/* 🔥 TIMELINE */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h6" ml={1}>Status Timeline</Typography>
        </Box>

        {statusData.timeline && statusData.timeline.length > 0 ? (
          <List>
            {statusData.timeline.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Chip
                      label={item.status}
                      color={statusColors[item.status]?.color || "default"}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography component="span" fontWeight="bold">
                          {item.status}
                        </Typography>
                        <Chip
                          label={item.comment || "Status updated"}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        <AccessTimeIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                        {item.changedAt || "Unknown time"}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < statusData.timeline.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Alert severity="info">
            No status updates yet. This is a new complaint.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
