// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const configureGoogleSignIn = () => {
//     GoogleSignin.configure({
//         scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
//         webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Get this from your Google Cloud Console
//         offlineAccess: true,
//     });
// };

// export const useGoogleAuth = () => {
//     const handleGoogleSignIn = async () => {
//         try {
//             await GoogleSignin.hasPlayServices();
//             const userInfo = await GoogleSignin.signIn();

//             // Send the ID token to your backend
//             const response = await fetch('http://YOUR_BACKEND_URL/auth/google', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ token: userInfo.idToken }),
//             });

//             const data = await response.json();
//             if (data.token) {
//                 await AsyncStorage.setItem('accessToken', data.token);
//                 // Handle successful login (e.g., navigate to dashboard)
//                 return { success: true, data: userInfo };
//             } else {
//                 throw new Error('Failed to get token from server');
//             }
//         } catch (error) {
//             if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//                 // User cancelled the login flow
//             } else if (error.code === statusCodes.IN_PROGRESS) {
//                 // Operation (e.g. sign in) is in progress already
//             } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//                 // Play services not available or outdated
//             } else {
//                 // Some other error happened
//             }
//             console.error('Google Sign-In Error:', error);
//             return { success: false, error };
//         }
//     };

//     return { handleGoogleSignIn };
// };