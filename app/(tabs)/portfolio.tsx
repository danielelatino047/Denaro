import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity style={styles.historyButton}>
          <MaterialIcons name="history" color="#00D4AA" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
          <Text style={styles.summaryValue}>$10,000.00</Text>
          <View style={styles.pnlContainer}>
            <MaterialIcons name="trending-up" color="#00D4AA" size={16} />
            <Text style={[styles.pnlText, { color: "#00D4AA" }]}>
              +$0.00 (24h)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Portfolio</Text>
          <Text style={styles.demoText}>Portfolio functionality is working!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  historyButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  pnlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pnlText: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  demoText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    padding: 20,
  },
});