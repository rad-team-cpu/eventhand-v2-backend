interface VendorData {
  averageRating: number;
  numberOfReviews: number;
  recencyFactor: number; // A multiplier for recency, e.g., 1.2
  hasVerifiedID: boolean;
  numberOfVerifiedDocuments: number; // Number of verified documents
}

export const calculateCredScore = (data: VendorData) => {
  // Define weights
  const weightForRating = 0.5;
  const weightForNumberOfReviews = 0.3;
  const weightForRecency = 0.2;
  const weightForVerifiedID = 1.0;
  const weightForDocuments = 0.5;

  // Define bonuses
  const verifiedIDBonus = 2; // Bonus added if the vendor has a verified ID
  const documentVerificationBonus = 1; // Bonus per document

  // Calculate the score
  const ratingScore = data.averageRating * weightForRating;
  const reviewScore = data.numberOfReviews * weightForNumberOfReviews;
  const recencyScore = data.recencyFactor * weightForRecency;
  const idScore = data.hasVerifiedID
    ? verifiedIDBonus * weightForVerifiedID
    : 0;
  const documentsScore =
    data.numberOfVerifiedDocuments *
    documentVerificationBonus *
    weightForDocuments;

  // Sum up all components
  const credibilityScore =
    ratingScore + reviewScore + recencyScore + idScore + documentsScore;

  return credibilityScore;
};
