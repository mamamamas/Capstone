import { Modal, Text, View, TouchableOpacity } from 'react-native';

const CustomAlert = () => {
    return (
        <Modal visible={true} animationType="slide">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Network Error</Text>
                <Text style={{ fontSize: 18, marginTop: 10 }}>
                    Please check your internet connection and try again.
                </Text>
                <TouchableOpacity onPress={() => fetchPosts()} style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 18, color: 'blue' }}>Retry</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default CustomAlert;