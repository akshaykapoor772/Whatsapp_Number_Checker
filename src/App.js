import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Switch } from '@mui/material';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import './App.css';
import UsersPage from './pages/UsersPage'; // Ensure this component exists
import AdminPage from './pages/AdminPage'; // Ensure this component exists

function App() {
    const [darkMode, setDarkMode] = useState(false);  // State to toggle between themes

    const theme = useMemo(() => createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    }), [darkMode]);

    const handleThemeChange = (event) => {
        setDarkMode(event.target.checked);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Drawer
                    variant="permanent"
                    anchor="left"
                >
                    <List>
                        <ListItem button key="theme" style={{ justifyContent: 'center' }}>
                            <WbSunnyOutlinedIcon style={{ fontSize: '20px' }} color="action" />
                            <Switch
                                size="small"
                                checked={darkMode}
                                onChange={handleThemeChange}
                                inputProps={{ 'aria-label': 'Toggle light/dark theme' }}
                            />
                            <NightsStayOutlinedIcon style={{ fontSize: '20px' }} color="action" />
                        </ListItem>
                        {['Users', 'Admin'].map((text, index) => (
                            <ListItem button key={text} component={Link} to={text === 'Users' ? "/" : "/admin"}>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <div style={{ paddingLeft: 250, paddingRight:50 }}> {/* Offset content from the drawer */}
                    <Routes>
                        <Route path="/" element={<UsersPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;