import React, { Component } from 'react';
import { Text, View } from 'react-native';

class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught an error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View>
                    <Text>Something went wrong.</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
