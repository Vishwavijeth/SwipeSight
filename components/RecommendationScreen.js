import React, { useMemo, useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import { recommendationService } from "../utils/recommendationService";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

export default function RecommendationScreen() {
  const route = useRoute();
  const { gender = "Male" } = route.params || {};
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Fetch recommendations when screen mounts
    const items = recommendationService.getRecommendations(20, gender);
    setRecommendations(items);
  }, [gender]);

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(500)} // Staggered fade in
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.itemTitle}>{item.item}</Text>
          <Text style={styles.itemType}>{item.type}</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recommended For You</Text>
        <Text style={styles.subtitle}>Based on your style preferences</Text>
      </View>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA"
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    height: 220,
  },
  image: {
    width: "100%",
    height: 150,
  },
  infoContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemType: {
    fontSize: 12,
    color: "#888",
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: '600',
  },
});