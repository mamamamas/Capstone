import React from 'react';
// import { AppProvider, RealmProvider } from '@realm/react';
import Main from '../app/main'; // This should be your navigation setup
import { NavigationContainer } from '@react-navigation/native';
import ErrorBoundary from './ErrorBoundary';
// import retrieveUserData from './retrieveUserData';
import RefreshableScreen from './Reloading';
const App = () => {
    const appConfig = {
        id: "saulus-gneeuag",
        baseUrl: "https://realm.mongodb.com",
    };


    return (
        <ErrorBoundary>
            {/* <AppProvider id={appConfig.id} baseUrl={appConfig.baseUrl}>
              <RealmProvider> */}
            <NavigationContainer independent={true}>
                <Main />
            </NavigationContainer>
            {/* </RealmProvider>
            </AppProvider> */}
        </ErrorBoundary>
    );
};

export default App;
