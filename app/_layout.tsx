import React from 'react';
// import { AppProvider, RealmProvider } from '@realm/react';
import Main from '../app/main'; // This should be your navigation setup
import { NavigationContainer } from '@react-navigation/native';
import ErrorBoundary from './ErrorBoundary';
// import retrieveUserData from './retrieveUserData';

const App = () => {
    const appConfig = {
        id: "saulus-gneeuag",
        baseUrl: "https://realm.mongodb.com",
    };

    // The linking configuration for deep linking
    const linking = {
        prefixes: ['myapp://'], // Add your app's deep link prefixes here
        config: {
            screens: {
                InitialLogin: 'initial-login',
                AdminLogin: 'admin-login',
                AdminDashboard: 'admin-dashboard',
                User: 'user-dashboard',
                Login: 'login',
                Registration: 'registration', // Match this with "Registration" route name in Main.js
                StudentDetails: 'student-details',
                Add: 'add',
                StudentHome: 'student-home',
            },
        },
    };

    return (
        // <ErrorBoundary>
        //     <AppProvider id={appConfig.id} baseUrl={appConfig.baseUrl}>
        //         <RealmProvider>
        <NavigationContainer linking={linking} independent={true}>
            <Main />
        </NavigationContainer>
        //         </RealmProvider>
        //     </AppProvider>
        // </ErrorBoundary>
    );
};

export default App;
