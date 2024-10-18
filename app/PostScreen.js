// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Realm from 'realm';
// import { realm, PostSchema } from '../offline/postModel';


// const AdminPostScreen = ({ navigation }) => {
//     const [title, setTitle] = useState('');
//     const [content, setContent] = useState('');



//     const handlePost = async () => {
//         try {
//             const token = await AsyncStorage.getItem('accessToken');
//             const response = await axios.post('http://192.168.1.9:3000/admin/posts', {
//                 title,
//                 content,
//             }, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (response.status === 201) {
//                 Alert.alert('Success', 'Post created successfully');



//                 navigation.goBack();
//             } else {
//                 Alert.alert('Error', 'Failed to create post');
//             }
//         } catch (error) {
//             console.error('Error creating post:', error);
//             Alert.alert('Error', error.response?.data?.message || 'Something went wrong');


//         }
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.header}>Create Post</Text>
//             <TextInput
//                 style={styles.input}
//                 placeholder="Title"
//                 value={title}
//                 onChangeText={setTitle}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Content"
//                 value={content}
//                 onChangeText={setContent}
//                 multiline
//             />
//             <Button title="Post" onPress={handlePost} />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         justifyContent: 'center',
//     },
//     header: {
//         fontSize: 24,
//         marginBottom: 24,
//         textAlign: 'center',
//     },
//     input: {
//         height: 40,
//         borderColor: '#ccc',
//         borderWidth: 1,
//         marginBottom: 12,
//         paddingHorizontal: 8,
//     },
// });

// export default AdminPostScreen;
