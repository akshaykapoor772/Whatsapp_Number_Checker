import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Select, MenuItem } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './AdminAnalytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AdminAnalytics() {
  const [uploadStats, setUploadStats] = useState(null);
  const [uploadsOverTime, setUploadsOverTime] = useState(null);
  const [uploadEvents, setUploadEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const getToken = () => localStorage.getItem('token');
    const fetchStats = async () => {
      const token = getToken();
      const response = await axios.get('http://localhost:5500/api/admin/upload-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUploadStats(response.data[0]);
    };

    const fetchUploadsOverTime = async () => {
      const token = getToken();
      const response = await axios.get('http://localhost:5500/api/admin/uploads-over-time', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUploadsOverTime(response.data);
    };

    const fetchUploadEvents = async () => {
      const token = getToken();
      const response = await axios.get('http://localhost:5500/api/admin/upload-events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updatedData = response.data.map(event => ({
          ...event,
          file_sizes: event.file_sizes.reduce((acc, size) => acc + size, 0) / (1024 * 1024) // Sum and convert to MB
      }));
      setUploadEvents(updatedData);
    };

    fetchStats();
    fetchUploadsOverTime();
    fetchUploadEvents();
  }, []);

  const pieData = () => ({
    labels: ['Valid Phone Numbers', 'Invalid Phone Numbers'],
    datasets: [{
      label: 'Upload Stats',
      data: uploadStats ? [uploadStats.totalValidNumbers, uploadStats.totalInvalidNumbers] : [],
      backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
      borderWidth: 1
    }]
  });

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1
  };

  const barData = (data) => ({
    labels: data.map(item => item._id),
    datasets: [
      {
        label: 'Valid Phone Numbers',
        data: data.map(item => item.validNumbers),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Invalid Phone Numbers',
        data: data.map(item => item.invalidNumbers),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
      }
    ]
  });

  const uploadEventsChartData = () => {
    if (!selectedEvent) {
      return { labels: [], datasets: [] }; // Return empty data if no event is selected
    }
  
    return {
      labels: [selectedEvent.user_email],
      datasets: [
        {
          label: 'Total Phone Numbers',
          data: [selectedEvent.total_numbers],
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        },
        {
          label: 'Valid Phone Numbers',
          data: [selectedEvent.valid_numbers],
          backgroundColor: 'rgba(153, 102, 255, 0.5)'
        },
        {
          label: 'Invalid Phone Numbers',
          data: [selectedEvent.invalid_numbers],
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }
      ]
    };
  };

  const handleSelectEvent = (event) => {
    const eventId = event.target.value;
    const selected = uploadEvents.find(e => e._id === eventId);
    setSelectedEvent(selected);
  };

  return (
    <div className="admin-analytics">
      {uploadEvents.length > 0 && (
        <div className="event-selection">
          <h3>Select Upload Event for Details</h3>
          <Select
            onChange={handleSelectEvent}
            displayEmpty
            value={selectedEvent ? selectedEvent._id.toString() : ""}
            style={{ width: '300px' }} // Adjust the width as necessary
          >
            <MenuItem value="" disabled>Select an Event</MenuItem>
            {uploadEvents.map((event, index) => (
              <MenuItem key={index} value={event._id.toString()}>
                {`${event.user_email} - ${new Date(event.timestamp).toLocaleString()} - ${event.file_names.join(', ').substring(0, 50)}`}
              </MenuItem>
            ))}
          </Select>
        </div>
      )}
      {selectedEvent && (
        <Card className="card full-width-card">
          <CardContent>
            <Typography variant="h5">Detailed Upload Events Data for {selectedEvent.user_email}</Typography>
            <Bar data={uploadEventsChartData()} options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.dataset.label + ': ' + context.raw.toFixed(2);
                    },
                    afterLabel: function(context) {
                      return `File Names: ${selectedEvent.file_names.join(", ")}`;
                    }
                  }
                }
              }
            }} />
          </CardContent>
        </Card>
      )}
      <div className="stats-charts">
        {uploadStats && (
            <>
            <Card className="card one-third-card">
                <CardContent>
                <Typography variant="h5">Lifetime File Upload Stats</Typography>
                <Pie ref={pieChartRef} data={pieData()} options={pieOptions} />
                </CardContent>
            </Card>
            <Card className="card one-third-card">
            <CardContent>
                <Typography variant="h5">Total Upload Stats</Typography>
                <Typography variant="body1" style={{ marginTop: 20 }}>
                    Total Files Processed: {uploadStats.totalFiles} Files
                </Typography>
                <Typography variant="body1" style={{ marginTop: 10 }}>
                    Total Valid Numbers: {uploadStats.totalValidNumbers}
                </Typography>
                <Typography variant="body1" style={{ marginTop: 10 }}>
                    Total InValid Numbers: {uploadStats.totalInvalidNumbers}
                </Typography>
                <Typography variant="body1" style={{ marginTop: 10 }}>
                    Total Phone Numbers Processed: {uploadStats.totalNumbers}
                </Typography>
                </CardContent>
            </Card>
            </>
        )}
        {uploadsOverTime && (
            <Card className="card two-thirds-card">
            <CardContent>
                <Typography variant="h5">Uploads Over Time</Typography>
                <Bar ref={chartRef} data={barData(uploadsOverTime)} options={{ responsive: true }} />
            </CardContent>
            </Card>
        )}
        </div>
    </div>
  );
}

export default AdminAnalytics;