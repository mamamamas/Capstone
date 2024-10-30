import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Text, StyleSheet } from 'react-native';

const RefreshableScreen = ({ children }) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate a network request or data fetching
        setTimeout(() => {
            setRefreshing(false);
            // Optionally call a function to reload your data here
        }, 1000);
    }, []);

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {children}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RefreshableScreen;
