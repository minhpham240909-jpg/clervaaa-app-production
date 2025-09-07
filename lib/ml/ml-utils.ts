// ============================================================================
// MACHINE LEARNING UTILITIES
// ============================================================================

/**
 * Normalize features to [0, 1] range
 */
export function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v: any) => (v - min) / (max - min));
}

/**
 * Z-score normalization (standardization)
 */
export function standardize(values: number[]): number[] {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return values.map(() => 0);
  return values.map((v: any) => (v - mean) / stdDev);
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return Infinity;
  
  return Math.sqrt(
    vecA.reduce((sum, val, i) => sum + Math.pow(val - vecB[i], 2), 0)
  );
}

/**
 * Simple linear regression
 */
export function linearRegression(x: number[], y: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
  predict: (value: number) => number;
} {
  const n = x.length;
  if (n !== y.length || n === 0) {
    throw new Error('Invalid input arrays');
  }

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const meanY = sumY / n;
  const ssRes = y.reduce((sum, val, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(val - predicted, 2);
  }, 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);

  return {
    slope,
    intercept,
    rSquared,
    predict: (value: number) => slope * value + intercept
  };
}

/**
 * K-means clustering (simplified implementation)
 */
export function kMeansCluster(
  data: number[][],
  k: number,
  maxIterations: number = 100
): {
  centroids: number[][];
  clusters: number[][];
  labels: number[];
} {
  if (data.length === 0 || k <= 0) {
    throw new Error('Invalid input');
  }

  const dimensions = data[0].length;
  
  // Initialize centroids randomly
  let centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    const centroid = [];
    for (let j = 0; j < dimensions; j++) {
      const values = data.map((point: any) => point[j]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      centroid.push(min + Math.random() * (max - min));
    }
    centroids.push(centroid);
  }

  let labels = new Array(data.length).fill(0);
  let prevLabels = [];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    prevLabels = [...labels];

    // Assign points to closest centroid
    for (let i = 0; i < data.length; i++) {
      let minDistance = Infinity;
      let closestCentroid = 0;

      for (let j = 0; j < k; j++) {
        const distance = euclideanDistance(data[i], centroids[j]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = j;
        }
      }

      labels[i] = closestCentroid;
    }

    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterPoints = data.filter((_, idx) => labels[idx] === i);
      if (clusterPoints.length > 0) {
        const newCentroid = [];
        for (let j = 0; j < dimensions; j++) {
          const sum = clusterPoints.reduce((sum, point) => sum + point[j], 0);
          newCentroid.push(sum / clusterPoints.length);
        }
        centroids[i] = newCentroid;
      }
    }

    // Check convergence
    if (JSON.stringify(labels) === JSON.stringify(prevLabels)) {
      break;
    }
  }

  // Create clusters
  const clusters: number[][] = Array.from({ length: k }, () => []);
  data.forEach((_, idx) => {
    clusters[labels[idx]].push(idx);
  });

  return { centroids, clusters, labels };
}

/**
 * Exponential moving average
 */
export function exponentialMovingAverage(
  values: number[],
  alpha: number = 0.3
): number[] {
  if (values.length === 0) return [];
  
  const ema = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(alpha * values[i] + (1 - alpha) * ema[i - 1]);
  }
  return ema;
}

/**
 * Calculate feature importance using correlation with target
 */
export function calculateFeatureImportance(
  features: number[][],
  target: number[]
): number[] {
  const importance: number[] = [];
  
  for (let i = 0; i < features[0].length; i++) {
    const featureValues = features.map((row: any) => row[i]);
    const correlation = Math.abs(pearsonCorrelation(featureValues, target));
    importance.push(correlation);
  }
  
  return importance;
}

/**
 * Pearson correlation coefficient
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Train-test split for data
 */
export function trainTestSplit<T>(
  data: T[],
  testSize: number = 0.2
): { train: T[]; test: T[] } {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  const splitIndex = Math.floor(data.length * (1 - testSize));
  
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex)
  };
}

/**
 * Calculate model metrics
 */
export function calculateMetrics(
  actual: number[],
  predicted: number[]
): {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
} {
  if (actual.length !== predicted.length) {
    throw new Error('Arrays must have same length');
  }

  const n = actual.length;
  
  // Mean Squared Error
  const mse = actual.reduce((sum, actual_i, i) => {
    return sum + Math.pow(actual_i - predicted[i], 2);
  }, 0) / n;

  // Root Mean Squared Error
  const rmse = Math.sqrt(mse);

  // Mean Absolute Error
  const mae = actual.reduce((sum, actual_i, i) => {
    return sum + Math.abs(actual_i - predicted[i]);
  }, 0) / n;

  // R-squared
  const actualMean = actual.reduce((sum, val) => sum + val, 0) / n;
  const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
  const residualSumSquares = actual.reduce((sum, actual_i, i) => {
    return sum + Math.pow(actual_i - predicted[i], 2);
  }, 0);
  
  const r2 = totalSumSquares === 0 ? 1 : 1 - (residualSumSquares / totalSumSquares);

  return { mse, rmse, mae, r2 };
}

/**
 * Sigmoid activation function
 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * ReLU activation function
 */
export function relu(x: number): number {
  return Math.max(0, x);
}

/**
 * Softmax activation function
 */
export function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const expValues = values.map((v: any) => Math.exp(v - max));
  const sum = expValues.reduce((acc, val) => acc + val, 0);
  return expValues.map((v: any) => v / sum);
}

/**
 * Generate polynomial features
 */
export function polynomialFeatures(
  features: number[][],
  degree: number = 2
): number[][] {
  return features.map((row: any) => {
    const polyFeatures = [...row];
    
    // Add interaction terms and polynomial terms
    for (let d = 2; d <= degree; d++) {
      for (let i = 0; i < row.length; i++) {
        polyFeatures.push(Math.pow(row[i], d));
      }
    }
    
    // Add interaction terms for degree 2
    if (degree >= 2) {
      for (let i = 0; i < row.length; i++) {
        for (let j = i + 1; j < row.length; j++) {
          polyFeatures.push(row[i] * row[j]);
        }
      }
    }
    
    return polyFeatures;
  });
}