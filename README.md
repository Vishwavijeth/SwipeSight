# Swipe Sight

Swipe Sight is a recommendation app that learns what users like based on how they swipe.  
Every interaction updates a dynamic preference model using vector similarity, time decay, and diversity scoring — ensuring recommendations stay **fresh, personalized, and non-repetitive**.

---

## 🚀 Features

### 🔥 Vector-Based Recommendation Engine
Implemented in `recommendationService.js`:

- Converts each product into a **10-dimensional feature vector**
- Learns user preferences from swipe behavior
- Computes relevance using **Cosine Similarity**
- Includes:
  - **Learning Rate** – adjusts impact of each swipe  
  - **Time Decay** – prioritizes recent interactions  
  - **Diversity Penalty** – avoids showing similar items repeatedly  

---

### 🎯 Real-Time Preference Learning

Integrated with `HomeScreen.js`:

- Right swipe → increases preference  
- Left swipe → decreases preference  
- User profile vector updates instantly  
- Recommendations change in real time based on user behavior  

---

### 🎨 Modern Recommendation UI

Implemented in `RecommendationScreen.js`:

- Smooth swipe animations  
- Clean, minimal UI  
- Dynamically generated recommendations based on your profile  

---

## 🧠 How the Algorithm Works

### ** Feature Vector**
Each item is encoded into a 10-element vector:
[Gold, Silver, Diamond, Ring, Chain, Bracelet, Stud, Kada, Male, Female]

The algorithm learns from how users swipe on items:

- **Right Swipe (Like)** → strengthens preference  
- **Left Swipe (Dislike)** → weakens preference  
- **Every swipe** updates a persistent **user profile vector**  
- Recommendations are generated using **Cosine Similarity**  
- A **Diversity Penalty** ensures item variety  

This allows Swipe Sight to act like a lightweight recommender system without requiring a backend ML model.

---

## 📦 Tech Stack

- React Native  
- JavaScript (feature vectors + similarity scoring)  
- Dynamic user preference modeling  
- Real-time recommendation updates  

---
