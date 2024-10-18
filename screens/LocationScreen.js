
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text, Linking, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import Colors from '../constants/Colors';

const GOOGLE_MAPS_APIKEY = 'AIzaSyCGW1QpsdvXbsBLUkzC3Moo5p8b4BWQR4Q';

const LocationScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapRef = useRef(null); // Reference for MapView

  const targetLocation = {
    latitude: 14.291960,
    longitude: 120.960681,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);

      if (location) {
        // Fetch the route from Google Directions API
        getRouteDirections(location.coords, targetLocation);
      }
    })();
  }, []);

  const getRouteDirections = async (origin, destination) => {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_MAPS_APIKEY}`
      );

      if (response.data.routes.length) {
        const points = decodePolyline(response.data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);

        // Calculate distance in kilometers
        const routeDistance = response.data.routes[0].legs[0].distance.value / 1000;
        setDistance(routeDistance.toFixed(2));
      }
    } catch (error) {
      Alert.alert('Error fetching directions', error.message);
    }
  };

  // Decode polyline from Google Directions API response
  const decodePolyline = (t, e = 5) => {
    let points = [];
    let lat = 0;
    let lng = 0;

    for (let index = 0, shift = 0, result = 0, byte = null, latitudeChange = 0, longitudeChange = 0; index < t.length;) {
      byte = null;
      shift = 0;
      result = 0;

      do {
        byte = t.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      latitudeChange = ((result & 1) ? ~(result >> 1) : (result >> 1));
      shift = 0;
      result = 0;

      do {
        byte = t.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      longitudeChange = ((result & 1) ? ~(result >> 1) : (result >> 1));

      lat += latitudeChange;
      lng += longitudeChange;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const openStreetView = () => {
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=14.291960,120.960681&heading=-45&pitch=38&fov=80`;
    Linking.openURL(streetViewUrl);
  };

  const centerMapOnTarget = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000); // Animation duration in milliseconds
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef} // Attach the reference to MapView
        style={styles.map}
        initialRegion={{
          latitude: targetLocation.latitude,
          longitude: targetLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={targetLocation}
          title="Emilio Aguinaldo Hwy"
          description="Dasmariñas, Cavite"
        />

        {/* Show the route (Polyline) */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="blue" // Route color
            strokeWidth={5} // Route width
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.pressable} onPress={openStreetView}>
          <Text style={styles.pressableText}>Street View</Text>
        </Pressable>
        <Pressable style={styles.pressable} onPress={centerMapOnTarget}>
          <Text style={styles.pressableText}>PCU Clinic</Text>
        </Pressable>
      </View>

      {distance && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>Distance: {distance} km</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 5,
    left: Dimensions.get('window').width / 4,
    right: Dimensions.get('window').width / 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  pressable: {
    backgroundColor: Colors.cobaltblue,
    padding: 10,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    marginBottom: 10, // Add margin to separate buttons
  },
  pressableText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 75,
  },
  distanceText: {
    color: 'white',
    fontSize: 16,
  },
});

export default LocationScreen;