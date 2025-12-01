import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import axios from "axios";
import REACT_APP_GOOGLE_MAPS_API_KEY from "../apiConfig";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const PlaceInput = ({ label, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchPlaces = async (text) => {
    setQuery(text);

    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=AIzaSyCOEMK2VFwaDMZIIiiYW6_PP1_ey9GkR9M`;
      const response = await axios.get(url);

      setResults(response.data.predictions);
    } catch (err) {
      console.log("Places error:", err);
    }
  };

  const selectPlace = async (place) => {
    setQuery(place.description);
    setResults([]);

    try {
      const detailURL = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${REACT_APP_GOOGLE_MAPS_API_KEY}`;
      const response = await axios.get(detailURL);

      const loc = response.data.result.geometry.location;

      onSelect({
        description: place.description,
        latitude: loc.lat,
        longitude: loc.lng,
      });
    } catch (err) {
      console.log("Detail fetch error:", err);
    }
  };

  return (
    <View style={{ width: "100%" }}>
      {/* Search Input Container */}
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="place"
          size={18}
          color="#9C7A56"
          style={styles.inputIcon}
        />

        <TextInput
          placeholder="Enter place"
          placeholderTextColor="#AAA"
          value={query}
          onChangeText={searchPlaces}
          style={styles.textInput}
        />
      </View>

      {/* Dropdown List */}
      {results.length > 0 && (
        <FlatList
          style={styles.dropdown}
          data={results}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectPlace(item)}>
              <Text style={styles.item}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default PlaceInput;

/* -----------------------------------------------------
      COMPACT UI STYLES (MATCHES YOUR SCREEN)
------------------------------------------------------ */

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F4EF",
    borderWidth: 1,
    borderColor: "#E8DCC8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,       // medium compact
    minHeight: 44,             // medium compact
  },

  inputIcon: {
    marginRight: 8,
  },

  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#2C1810",
    paddingVertical: 0,
  },

  dropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DCC8",
    borderRadius: 10,
    marginTop: 6,
    elevation: 1,
    maxHeight: 160,
    overflow: "hidden",
  },

  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#333",
    borderBottomWidth: 0.7,
    borderColor: "#EEE",
  },
});
