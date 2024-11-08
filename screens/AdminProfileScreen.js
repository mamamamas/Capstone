import { View, ScrollView, useWindowDimensions, Text, Pressable, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { BarChart, PieChart } from 'react-native-chart-kit';
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
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [barChartData, setBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchBarChartData(), fetchPieChartData()]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBarChartData = async () => {
    try {
      const response = await fetch('http://192.168.1.9:3000/charts/health');
      const data = await response.json();
      console.log('Bar chart data:', data);
      if (Array.isArray(data) && data.length > 0) {
        const formattedData = {
          labels: data.map(item => item.name),
          datasets: [{
            data: data.map(item => item.counts)
          }]
        };
        setBarChartData(formattedData);
      } else {
        console.error('Invalid bar chart data format:', data);
        setError('Invalid bar chart data format');
      }
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
      throw error;
    }
  };

  const fetchPieChartData = async () => {
    try {
      const response = await fetch('http://192.168.1.9:3000/charts');
      const data = await response.json();
      console.log('Pie chart data:', data);
      if (Array.isArray(data) && data.length > 0) {
        const formattedData = data.map(item => ({
          name: item.stockItemName.slice(0, 10),
          population: item.totalConsumed,
          color: getRandomColor(),
          legendFontColor: '#7F7F7F',
          legendFontSize: 15
        }));
        setPieChartData(formattedData);
      } else {
        console.error('Invalid pie chart data format:', data);
        setError('Invalid pie chart data format');
      }
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
      throw error;
    }
  };

  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const handlePressHealthRecords = () => {
    navigation.navigate('StudentRecordScreen');
  };

  const handlePressCreateAccount = () => {
    navigation.navigate('Create Account');
  };

  const handlePressManageStock = () => {
    navigation.navigate('StockScreen');
  };

  const handlePressManageAccounts = () => {
    navigation.navigate('Manage Account');
  };

  const pressableStyle = {
    padding: 10,
    backgroundColor: Colors.cobaltblue,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  };

  const pressableTextStyle = {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.cobaltblue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        <Pressable onPress={fetchData} style={[pressableStyle, { marginTop: 20 }]}>
          <Text style={pressableTextStyle}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      <View>
        {/* Pressables Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap' }}>
          <Pressable onPress={handlePressHealthRecords} style={[pressableStyle, { marginBottom: 10, width: '48%' }]}>
            <Text style={pressableTextStyle}>Health Records</Text>
          </Pressable>

          <Pressable onPress={handlePressCreateAccount} style={[pressableStyle, { marginBottom: 10, width: '48%' }]}>
            <Text style={pressableTextStyle}>Create Account</Text>
          </Pressable>

          <Pressable onPress={handlePressManageStock} style={[pressableStyle, { marginBottom: 10, width: '48%' }]}>
            <Text style={pressableTextStyle}>Manage Stock</Text>
          </Pressable>

          <Pressable onPress={handlePressManageAccounts} style={[pressableStyle, { marginBottom: 10, width: '48%' }]}>
            <Text style={pressableTextStyle}>Manage Accounts</Text>
          </Pressable>
        </View>

        <ChartTitle title="Top 5 Major Health Concerns" />
        {barChartData ? (
          <BarChart
            data={barChartData}
            width={width - 40}
            height={420}
            fromZero={true}
            chartConfig={chartConfig}
            verticalLabelRotation={50}
            showValuesOnTopOfBars={false}
            style={{
              marginLeft: -10,
              backgroundColor: '#fff',
              borderRadius: 50,
              paddingVertical: 20,
              marginVertical: 10,
            }}
          />
        ) : (
          <Text>No bar chart data available</Text>
        )}

        <ChartTitle title="Health Statistics" />
        {pieChartData ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 50, paddingVertical: 20, marginVertical: 10 }}>
            <PieChart
              data={pieChartData}
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
        ) : (
          <Text>No pie chart data available</Text>
        )}

        <ChartTitle title="Insights" />
        <InsightSection />
      </View>
    </ScrollView>
  );
};

export default AdminProfileScreen;