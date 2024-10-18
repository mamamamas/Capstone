// import React, { createContext, useState, useContext } from 'react';
// import axios from 'axios';

// // Create a context
// export const AuthContext = createContext();

// // Create a provider component
// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null); // User state

//     // Function to log in the user
//     const login = async (email, password) => {
//         try {
//             const response = await axios.post('http://192.168.1.10:3000/login', {
//                 email,
//                 password,
//             });
//             if (response.data.message === 'Login successful') {
//                 setUser(response.data.user); // Set user data
//                 return true;
//             }
//             return false;
//         } catch (error) {
//             console.error('Login failed', error);
//             return false;
//         }
//     };

//     // Function to log out the user
//     const logout = () => {
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };
