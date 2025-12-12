import { recommendItems } from "../items/recommendItems";

// --- Configuration ---
const LEARNING_RATE = 0.5; // How much a single swipe affects preferences
const DECAY_FACTOR = 0.95; // Preference decay per swipe (prioritizes recent)
const DIVERSITY_PENALTY = 0.2; // Penalty for items too similar to already selected ones

// --- Feature Extraction ---
// We need to convert items into vectors.
// Features: [isGold, isSilver, isDiamond, isRing, isChain, isBracelet, isStud, isKada, isMale, isFemale]
// Note: This is a simplified feature set. In a real app, you might automate this.
const FEATURES = [
    "Gold",
    "Silver",
    "Diamond",
    "Ring",
    "Chain",
    "Bracelet",
    "Stud",
    "Kada",
    "Male",
    "Female",
];

const getItemVector = (item) => {
    const vector = new Array(FEATURES.length).fill(0);
    // Type mapping (case-insensitive check)
    const itemType = item.type ? item.type.toLowerCase() : "";
    const itemCategory = item.item ? item.item.toLowerCase() : "";
    const itemGender = item.gender ? item.gender.toLowerCase() : "";

    FEATURES.forEach((feature, index) => {
        const f = feature.toLowerCase();
        if (itemType === f || itemCategory === f || itemGender === f) {
            vector[index] = 1;
        }
    });
    return vector;
};

// --- Vector Math Helpers ---
const addVectors = (v1, v2) => v1.map((val, i) => val + v2[i]);
const subtractVectors = (v1, v2) => v1.map((val, i) => val - v2[i]);
const scaleVector = (v, s) => v.map((val) => val * s);
const dotProduct = (v1, v2) =>
    v1.reduce((sum, val, i) => sum + val * v2[i], 0);
const magnitude = (v) => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
const cosineSimilarity = (v1, v2) => {
    const mag1 = magnitude(v1);
    const mag2 = magnitude(v2);
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct(v1, v2) / (mag1 * mag2);
};

// --- Service Class ---
class RecommendationService {
    constructor() {
        this.userProfile = new Array(FEATURES.length).fill(0);
    }

    // Reset profile (e.g., when gender filter changes or app restarts)
    resetProfile() {
        this.userProfile = new Array(FEATURES.length).fill(0);
    }

    // Update profile based on swipe
    // direction: 'right' (like) or 'left' (dislike)
    updateProfile(item, direction) {
        const itemVector = getItemVector(item);

        // Apply Decay: History matters less over time
        this.userProfile = scaleVector(this.userProfile, DECAY_FACTOR);

        // Update with new interaction
        if (direction === "right") {
            const weightedVector = scaleVector(itemVector, LEARNING_RATE);
            this.userProfile = addVectors(this.userProfile, weightedVector);
        } else {
            // For dislikes, we subtract, but maybe with a smaller weight to be less aggressive
            const weightedVector = scaleVector(itemVector, LEARNING_RATE * 0.5);
            this.userProfile = subtractVectors(this.userProfile, weightedVector);
        }
    }

    // Get Top N Recommendations
    getRecommendations(k = 10, filterGender = null, excludeIds = []) {
        // 1. Calculate similarity scores for all items
        let candidates = recommendItems.map((item) => {
            // Basic Filtering
            if (filterGender && item.gender.toLowerCase() !== filterGender.toLowerCase()) {
                return { item, score: -Infinity };
            }
            if (excludeIds.includes(item.id)) {
                return { item, score: -Infinity };
            }

            const itemVector = getItemVector(item);
            const score = cosineSimilarity(this.userProfile, itemVector);
            return { item, score, vector: itemVector };
        });

        // Filter out invalid candidates
        candidates = candidates.filter((c) => c.score !== -Infinity);

        // 2. Select top K items with Diversity
        // Greedy algorithm: Pick best scoring item, then penalize similar items
        const results = [];

        // Sort initially by raw similarity score
        candidates.sort((a, b) => b.score - a.score);

        while (results.length < k && candidates.length > 0) {
            // Pick the best current candidate
            const best = candidates[0];
            results.push(best.item);

            // Remove it from pool
            candidates.shift();

            // Re-score remaining candidates to penalize similarity to the item just picked
            // This ensures we don't just show 10 identical gold rings
            candidates.forEach((candidate) => {
                const similarityToSelected = cosineSimilarity(best.vector, candidate.vector);
                // Reduce score if it's too similar to what we just picked
                candidate.score -= similarityToSelected * DIVERSITY_PENALTY;
            });

            // Re-sort based on adjusted scores
            candidates.sort((a, b) => b.score - a.score);
        }

        return results;
    }

    // Debug helper
    getProfileDebug() {
        return FEATURES.map((f, i) => `${f}: ${this.userProfile[i].toFixed(2)}`).join(', ');
    }
}

export const recommendationService = new RecommendationService();
