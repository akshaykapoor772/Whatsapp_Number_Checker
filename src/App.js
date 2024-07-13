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
import Login from './components/Login';
import UserLogin from './components/UserLogin';

function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
    const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));

    const theme = useMemo(() => createTheme({
        palette: { mode: darkMode ? 'dark' : 'light' },
    }), [darkMode]);

    const handleAdminLogout = () => {
        localStorage.removeItem('adminToken');
        setAdminToken(null);
    };

    const handleUserLogout = () => {
        localStorage.removeItem('userToken');
        setUserToken(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Drawer variant="permanent" anchor="left">
                    <List>
                        {/* Theme Toggle */}
                        <ListItem button key="theme" style={{ justifyContent: 'center' }}>
                            <WbSunnyOutlinedIcon />
                            <Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                            <NightsStayOutlinedIcon />
                        </ListItem>
                        {/* Navigation Links */}
                        <ListItem button key="Users" component={Link} to="/">
                            <ListItemIcon><InboxIcon /></ListItemIcon>
                            <ListItemText primary="Users" />
                        </ListItem>
                        <ListItem button key="Admin" component={Link} to="/admin/login">
                            <ListItemIcon><MailIcon /></ListItemIcon>
                            <ListItemText primary="Admin" />
                        </ListItem>
                    </List>
                </Drawer>
                <div style={{ paddingLeft: 250, paddingRight: 50 }}>
                    <Routes>
                        <Route path="/" element={userToken ? <UsersPage handleUserLogout={handleUserLogout}/> : <Navigate replace to="/user/login" />} />
                        <Route path="/user/login" element={userToken ? <Navigate replace to="/" /> : <UserLogin setToken={setUserToken} />} />
                        <Route path="/admin/login" element={adminToken ? <Navigate replace to="/admin" /> : <Login setToken={setAdminToken} />} />
                        <Route path="/admin" element={adminToken ? <AdminPage handleAdminLogout={handleAdminLogout}/> : <Navigate replace to="/admin/login" />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;