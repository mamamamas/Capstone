
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const retrieveUserData = async ({ navigation }) => {
//     try {
//         const id = await AsyncStorage.getItem('id');
//         const accessToken = await AsyncStorage.getItem('accessToken');
//         const role = await AsyncStorage.getItem('role');
//         const firstname = await AsyncStorage.getItem('firstname');
//         if (role) {
//             if (role === 'admin' || role === 'Nurse') {
//                 navigation.navigate('Add');
//             } else if (role === 'user') {
//                 navigation.navigate('user');
//             }
//         }
//     } catch (error) {
//         console.error('Error retrieving user data:', error);
//     }
// };

// export default retrieveUserData;