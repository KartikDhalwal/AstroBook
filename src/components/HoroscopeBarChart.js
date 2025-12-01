import React from "react";
import { View, Text, StyleSheet } from "react-native";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const HoroscopeBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxValue = 100;

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const barColor = getRandomColor(); // generate random color for each bar

        return (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>

            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: '#db9a4a', // apply random color
                  },
                ]}
              />
            </View>

            <Text style={styles.value}>{item.value}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default HoroscopeBarChart;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 80,
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  barWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: "#f2e7dc",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 10,
  },
  bar: {
    height: "100%",
    borderRadius: 12,
  },
  value: {
    fontSize: 13,
    color: "#444",
    width: 30,
    textAlign: "right",
  },
});
