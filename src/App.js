import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Switch } from '@mui/material';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import './App.css';
import UsersPage from './pages/UsersPage';
import AdminPage from './pages/AdminPage';
import Login from './components/Login'; // Import the Login component

function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

    const theme = useMemo(() => createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    }), [darkMode]);

    const handleThemeChange = (event) => {
        setDarkMode(event.target.checked);
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('adminToken');
        setAdminToken(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Drawer variant="permanent" anchor="left">
                    <List>
                        <ListItem button key="theme" style={{ justifyContent: 'center' }}>
                            <WbSunnyOutlinedIcon style={{ fontSize: '20px' }} color="action" />
                            <Switch size="small" checked={darkMode} onChange={handleThemeChange} inputProps={{ 'aria-label': 'Toggle light/dark theme' }} />
                            <NightsStayOutlinedIcon style={{ fontSize: '20px' }} color="action" />
                        </ListItem>
                        <ListItem button key="Users" component={Link} to="/">
                            <ListItemIcon><InboxIcon /></ListItemIcon>
                            <ListItemText primary="Users" />
                        </ListItem>
                        <ListItem button key="Admin" component={Link} to="/admin/login">
                            <ListItemIcon><MailIcon /></ListItemIcon>
                            <ListItemText primary="Admin" />
                        </ListItem>
                        {adminToken && (
                            <ListItem button key="Logout" onClick={handleAdminLogout}>
                                <ListItemIcon><MailIcon /></ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItem>
                        )}
                    </List>
                </Drawer>
                <div style={{ paddingLeft: 250, paddingRight: 50 }}>
                    <Routes>
                        <Route path="/" element={<UsersPage />} />
                        <Route path="/admin/login" element={adminToken ? <Navigate replace to="/admin" /> : <Login setToken={setAdminToken} />} />
                        <Route path="/admin" element={adminToken ? <AdminPage /> : <Navigate replace to="/admin/login" />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;