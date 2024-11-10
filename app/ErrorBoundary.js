import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from 'react-native-vector-icons'; // Importing Ionicons from react-native-vector-icons

class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer}>
                    {/* Using Ionicons for an error icon */}
                    <Ionicons
                        name="alert-circle-outline" // A red error alert icon
                        size={50} // Icon size
                        color="#721c24" // Dark red color for error
                        style={styles.errorIcon}
                    />
                    <Text style={styles.errorMessage}>Something went wrong.</Text>
                    <Text style={styles.errorDetails}>Please try again later.</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8d7da', // Light red background for error state
        padding: 20,
        borderRadius: 10,
        margin: 20,
    },
    errorIcon: {
        marginBottom: 20,
    },
    errorMessage: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#721c24', // Dark red for error message
        marginBottom: 10,
    },
    errorDetails: {
        fontSize: 16,
        color: '#721c24', // Dark red for additional error text
    },
});

export default ErrorBoundary;
