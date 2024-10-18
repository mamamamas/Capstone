import React, { useState, useCallback, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import moment from 'moment';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Pressable,
    Platform,
    Alert
} from "react-native";


const Add = () => {
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiredDate, setExpiredDate] = useState("");
    const [manufactors, setManufactors] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [createdAt, setCreatedAt] = useState("");
    const [expired, setExpired] = useState(false);
    const [status, setStatus] = useState(""); // New state for status
    const [startingCount, setStartingCount] = useState(""); // New state for startingCount
    const navigation = useNavigation();
    const handleInformation = () => {
        const inventoryData = {
            itemName: itemName,
            quantity: quantity,
            expiredDate: expiredDate,
            manufactors: manufactors,
            createdAt: createdAt,
        }

        axios.post("http://192.168.1.10:3000/inventory/add", inventoryData,)
            .then((response) => {
                console.log(response.data);
                Alert.alert("Information added", "", [
                    {
                        text: "OK",
                        onPress: () => {
                            // Babalik sa inventory
                            navigation.navigate("Archive");


                        },
                    },
                ]);
            })
            .catch((error) => {
                Alert.alert("MAGLAGAY KA MUNAAA!!", "", [
                    {
                        text: "OK",
                        onPress: () => {
                            console.log('Failed' + error);
                        },
                    },
                ]);
            });

        // Handle submit button press
        console.log("Item Name:", itemName);
        console.log("Quantity:", quantity);
        console.log("Expired Date:", expiredDate);
        console.log("Created At:", createdAt);
        console.log("Manufacturer:", manufactors);
    };



    // Date Picker para sa expiration date
    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onChange = (event, selectedDate) => {
        if (event.type === 'set') {
            const currentDate = selectedDate || date;
            setDate(currentDate);

            if (Platform.OS === 'android') {
                toggleDatePicker();
                setExpiredDate(moment(currentDate).format('MMM DD YYYY'));
            }
        } else {
            toggleDatePicker();
        }
    };

    const calculateExpiration = () => {
        const diff = moment(expiredDate, 'MMM DD YYYY').diff(moment(), 'days');
        setExpired(diff < 0); // Set expired to true if the item is expired
    };

    useEffect(() => {
        calculateExpiration();
    }, [expiredDate]);





    return (

        <View style={styles.container}>
            <Text style={{ paddingLeft: "25%", fontWeight: "bold", fontSize: 20, marginBottom: 20 }}>
                Clinicsd Inventory
            </Text>

            {/* Item Name */}
            <View>
                <Text style={styles.inputLabel}>Item Name:</Text>
                <TextInput
                    style={styles.name}
                    value={itemName}
                    onChangeText={(text) => setItemName(text)}
                />
            </View>

            {/* Quantity */}
            <View>
                <Text style={styles.inputLabel}>Quantity:</Text>
                <TextInput
                    style={styles.name}
                    value={quantity}
                    onChangeText={(text) => setQuantity(text)}
                    keyboardType="numeric"
                />
            </View>

            <View>
                {/* Expiration Date */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Expired Date:</Text>
                    <View style={styles.dateContainer}>
                        {!showPicker && (
                            <Pressable onPress={toggleDatePicker}>
                                <View style={styles.datePressable}>
                                    <AntDesign name="calendar" size={24} color="black" style={styles.icon} />
                                    <TextInput
                                        style={{ color: "black", paddingRight: 50 }}
                                        value={expiredDate}
                                        onChangeText={(text) => setExpiredDate(text)}
                                        keyboardType="default"
                                        editable={false}
                                    />
                                </View>
                            </Pressable>
                        )}
                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="calendar"
                                onChange={onChange}
                                minimumDate={new Date()}
                            />
                        )}
                    </View>
                </View>
                {/* Manufacturer */}
                <View>
                    <Text style={styles.inputLabel}>Manufacturer:</Text>
                    <TextInput
                        style={styles.name}
                        value={manufactors}
                        onChangeText={(text) => setManufactors(text)}
                        keyboardType="default"
                    />
                </View>
                {/* Add button */}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleInformation}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}
export default Add;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        justifyContent: "center",
    },
    inputContainer: {
        flexDirection: "column",
        marginBottom: 20,
    },
    inputLabel: {
        fontWeight: "bold",
        width: 100,
        marginRight: 10,
        marginBottom: 10,
    },
    inputText: {
        borderBottomWidth: 1,
        borderColor: "#ADD8E6",
        borderRadius: 5,
        paddingHorizontal: 10,
        flex: 1,
        marginRight: 10,
        flexDirection: "row",
        color: 'black'
    },
    button: {
        backgroundColor: "#ADD8E6",
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 20,
        marginTop: 20,
    },
    buttonText: {
        color: "black",
        fontWeight: "bold",
    },
    name: {
        borderBottomWidth: 1,
        borderColor: "#ADD8E6",
        marginBottom: 20,
        paddingLeft: 10,
        flexDirection: "row",
    },
    icon: {
        marginRight: 10,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    datePressable: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: "#ADD8E6",
        paddingHorizontal: 10,
        paddingVertical: 5,
        paddingRight: 100,

    },
});