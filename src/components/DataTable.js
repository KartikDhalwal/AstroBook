import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const DataTable = ({ columns, rows }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* HEADER */}
        <View style={[styles.row, styles.headerRow]}>
          {columns.map(col => (
            <View
              key={col.key}
              style={[styles.cell, { width: col.width || 100 }]}
            >
              <Text style={styles.headerText}>{col.label}</Text>
            </View>
          ))}
        </View>

        {/* ROWS */}
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {columns.map(col => (
              <View
                key={col.key}
                style={[styles.cell, { width: col.width || 100 }]}
              >
                <Text style={styles.cellText}>
                  {row[col.key] ?? "—"}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default DataTable;
const styles = StyleSheet.create({
  table: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#FFF",
  },

  headerRow: {
    backgroundColor: "#FEF3C7",
  },

  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
    justifyContent: "center",
  },

  headerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7F1D1D",
    textAlign: "center",
  },

  cellText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
});
