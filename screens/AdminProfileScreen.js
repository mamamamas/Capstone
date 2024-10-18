import { View, ScrollView, useWindowDimensions, Text, Pressable } from 'react-native';
import React from 'react';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { diseaseData, pieData } from './Components/DiseaseData'; // Import the data
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/Colors';

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 71, 171, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

const ChartTitle = ({ title }) => (
  <Text style={{ fontSize: 20, textAlign: 'center', marginVertical: 10 }}>
    {title}
  </Text>
);

const InsightSection = () => (
  <View style={{ backgroundColor: '#fff', borderRadius: 50, padding: 20, marginVertical: 10 }}>
    <Text style={{ fontSize: 16, textAlign: 'justify', color: '#333' }}>
      The statistics indicate that PTB (Pulmonary Tuberculosis) and mental illness are major health concerns,
      affecting the highest number of students. Effective health programs and early detection initiatives should
      focus on these areas to reduce cases. Asthma and allergies are also significant, requiring proper management
      plans to ensure student well-being.
    </Text>
  </View>
);

const AdminProfileScreen = () => {
  const { width } = useWindowDimensions(); // Responsive width
  const navigation = useNavigation();

  const handlePressHealthRecords = () => {
    navigation.navigate('Student Record'); // Navigate to the Student Record Screen
  };

  const handlePressCreateAccount = () => {
    navigation.navigate('CreateAccountScreen'); // Or trigger a modal
  };

  const handlePressManageStock = () => {
    navigation.navigate('StockScreen'); // Placeholder for Manage Stock screen
  };

  const pressableStyle = {
    padding: 5,
    backgroundColor: Colors.cobaltblue,
    borderRadius: 150, // Increased border radius
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
    flex: 1, // Allow buttons to take equal width
    marginHorizontal: 5, // Add margin between buttons
  };

  const pressableTextStyle = {
    color: '#fff',
    textAlign: 'center',
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      <View>
        {/* Pressables Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <Pressable onPress={handlePressHealthRecords} style={pressableStyle}>
            <Text style={pressableTextStyle}>Health Records</Text>
          </Pressable>

          <Pressable onPress={handlePressCreateAccount} style={pressableStyle}>
            <Text style={pressableTextStyle}>Create Account</Text>
          </Pressable>

          <Pressable onPress={handlePressManageStock} style={pressableStyle}>
            <Text style={pressableTextStyle}>Manage Stock</Text>
          </Pressable>
        </View>

        {/* Bar Chart Section */}
        <ChartTitle title="Top 5 Major Health Concerns" />
        <BarChart
          data={diseaseData}
          width={width - 40}
          height={420}
          fromZero={true}
          chartConfig={chartConfig}
          verticalLabelRotation={50}
          showValuesOnTopOfBars={true} // Show values for better visualization
          style={{
            marginLeft: -10,
            backgroundColor: '#fff',
            borderRadius: 50,
            paddingVertical: 20,
            marginVertical: 10,
          }}
        />

        {/* Pie Chart Section */}
        <ChartTitle title="Health Statistics" />
        <View style={{ backgroundColor: '#fff', borderRadius: 50, paddingVertical: 20, marginVertical: 10 }}>
          <PieChart
            data={pieData}
            width={width - 20}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            paddingRight="17"
            absolute
            hasLegend={true}
          />
        </View>

        {/* Insights Section */}
        <ChartTitle title="Insights" />
        <InsightSection />
      </View>
    </ScrollView>
  );
};

export default AdminProfileScreen;
