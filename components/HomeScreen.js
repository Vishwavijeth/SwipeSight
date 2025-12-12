import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { displayItems } from "../items/displayItems";
import { recommendationService } from "../utils/recommendationService";
import { Card } from "./Cards";

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const MAX_SWIPES = 15;


  const [genderFilter, setGenderFilter] = useState("Male");
  const [currentItems, setCurrentItems] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);

  const shuffleArray = (array) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };


  // Use a ref to ensure service persistence across re-renders if needed, 
  // but since it's an exported singleton, direct import is fine. 
  // We just need to trigger re-renders or navigation.

  const [canNavigate, setCanNavigate] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);

  // Initial shuffle on gender change
  useEffect(() => {
    const filtered = displayItems.filter(
      (item) => item.gender.toLowerCase() === genderFilter.toLowerCase()
    );
    const shuffled = shuffleArray(filtered);
    setCurrentItems(shuffled);
    setCurrentCard(shuffled[0] || null);

    // Reset service profile and local swipe count
    recommendationService.resetProfile();
    setSwipeCount(0);
    setCanNavigate(false);
  }, [genderFilter]);

  const requiredSwipes = useMemo(
    () => Math.min(MAX_SWIPES, currentItems.length || 0),
    [currentItems.length]
  );

  const handleSwipe = (direction) => {
    // 1. Get current item
    // Note: react-native-deck-swiper passed cardIndex is the index of the card in the *original* array passed to it
    // But since we are popping items purely visually via the swiper, we need to track what we just swiped.
    // However, the safer way with this library is relying on the card prop passed to the callback if available, 
    // or using our current internal pointer if we trust it.

    // Actually, 'currentCard' state is updating *after* swipe in the callbacks below. 
    // So 'currentCard' right now is the one being swiped.
    if (currentCard) {
      recommendationService.updateProfile(currentCard, direction);
      // console.log("Profile Update:", recommendationService.getProfileDebug());
    }

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    if (newSwipeCount >= requiredSwipes && requiredSwipes > 0) {
      setCanNavigate(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jewels</Text>

      {/* Gender selector */}
      <View style={styles.genderSelector}>
        {["Male", "Female"].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.genderButton,
              genderFilter === gender && styles.activeGender,
            ]}
            onPress={() => setGenderFilter(gender)}
          >
            <Text
              style={[
                styles.genderText,
                genderFilter === gender && styles.activeGenderText,
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swiper */}
      <View style={styles.centerWrapper}>
        {currentItems.length > 0 && (
          <Swiper
            key={genderFilter} // remount on gender change
            cards={currentItems}
            renderCard={(card) => <Card item={card} />}
            cardIndex={0}
            onSwipedLeft={(cardIndex) => {
              handleSwipe("left");
              setCurrentCard(currentItems[cardIndex + 1] || null);
            }}
            onSwipedRight={(cardIndex) => {
              handleSwipe("right");
              setCurrentCard(currentItems[cardIndex + 1] || null);
            }}
            stackSize={3}
            verticalSwipe={false}
            backgroundColor="transparent"
          />
        )}
      </View>

      {/* Item details */}
      {currentCard && (
        <View style={styles.detailsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{currentCard.item}</Text>
          </View>
          <View style={styles.tagSecondary}>
            <Text style={styles.tagTextSecondary}>{currentCard.type}</Text>
          </View>
        </View>
      )}

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[
            styles.navButton,
            canNavigate
              ? { backgroundColor: "#FFD700" }
              : styles.navButtonDisabled,
          ]}
          disabled={!canNavigate}
          onPress={() =>
            navigation.navigate("Recommendation", {
              gender: genderFilter,
            })
          }
        >
          <Text style={styles.navText}>For You</Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 8, color: "#666" }}>
          {swipeCount}/{requiredSwipes || 0} swipes
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    padding: 30,
  },
  genderSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 15,
  },
  genderButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  activeGender: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
  genderText: { fontSize: 16, fontWeight: "600", color: "#444" },
  activeGenderText: { color: "#000" },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  tag: {
    backgroundColor: "#f4870bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  tagText: { fontSize: 15, fontWeight: "bold", color: "#000" },
  tagSecondary: {
    backgroundColor: "#eee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  tagTextSecondary: { fontSize: 15, fontWeight: "600", color: "#444" },
  bottomNav: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderColor: "#ccc",
    padding: 20,
  },
  navButton: {
    width: 160,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: { backgroundColor: "#ccc" },
  navText: { fontWeight: "bold", fontSize: 15, color: "#000" },
});
