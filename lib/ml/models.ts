// ============================================================================
// MACHINE LEARNING MODELS
// ============================================================================

import { 
  sigmoid, 
  relu, 
  euclideanDistance
} from './ml-utils';
import { logger } from '@/lib/logger';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateMetrics(actual: number[], predicted: number[]) {
  if (actual.length !== predicted.length) {
    throw new Error('Actual and predicted arrays must have the same length');
  }

  const n = actual.length;
  if (n === 0) return { mse: 0, r2: 0, mae: 0, rmse: 0 };

  // Mean Squared Error
  const mse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n;
  
  // Root Mean Squared Error
  const rmse = Math.sqrt(mse);
  
  // Mean Absolute Error
  const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;
  
  // R-squared
  const actualMean = actual.reduce((sum, val) => sum + val, 0) / n;
  const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
  const residualSumSquares = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  const r2 = totalSumSquares === 0 ? 1 : 1 - (residualSumSquares / totalSumSquares);

  return { mse, rmse, mae, r2 };
}

/**
 * Base Model Interface
 */
export interface MLModel<Input, Output> {
  fit(data: Input[], targets: Output[]): Promise<void>;
  predict(input: Input): Promise<Output>;
  evaluate(testData: Input[], testTargets: Output[]): Promise<ModelMetrics>;
  save(): string;
  load(modelData: string): void;
}

/**
 * Model performance metrics
 */
export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mse?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
}

/**
 * Neural Network Layer
 */
class DenseLayer {
  private weights: number[][];
  private biases: number[];
  private activation: (x: number) => number;

  constructor(
    inputSize: number,
    outputSize: number,
    activation: 'relu' | 'sigmoid' | 'linear' = 'relu'
  ) {
    // Initialize weights with Xavier initialization
    this.weights = Array.from({ length: inputSize }, () =>
      Array.from({ length: outputSize }, () => 
        Math.random() * 2 * Math.sqrt(6 / (inputSize + outputSize)) - Math.sqrt(6 / (inputSize + outputSize))
      )
    );
    
    this.biases = new Array(outputSize).fill(0);
    
    this.activation = activation === 'relu' ? relu : 
                     activation === 'sigmoid' ? sigmoid : 
                     (x: number) => x; // linear
  }

  forward(inputs: number[]): number[] {
    const outputs: number[] = [];
    
    for (let j = 0; j < this.weights[0].length; j++) {
      let sum = this.biases[j];
      for (let i = 0; i < inputs.length; i++) {
        sum += inputs[i] * this.weights[i][j];
      }
      outputs.push(this.activation(sum));
    }
    
    return outputs;
  }

  // Simplified backpropagation (for basic training)
  updateWeights(
    inputs: number[], 
    gradients: number[], 
    learningRate: number = 0.01
  ): void {
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        this.weights[i][j] -= learningRate * gradients[j] * inputs[i];
      }
    }
    
    for (let j = 0; j < this.biases.length; j++) {
      this.biases[j] -= learningRate * gradients[j];
    }
  }

  getWeights(): { weights: number[][]; biases: number[] } {
    return {
      weights: this.weights.map((row: any) => [...row]),
      biases: [...this.biases]
    };
  }

  setWeights(weights: number[][], biases: number[]): void {
    this.weights = weights.map((row: any) => [...row]);
    this.biases = [...biases];
  }
}

/**
 * Multi-Layer Perceptron (Neural Network)
 */
export class MultiLayerPerceptron implements MLModel<number[], number[]> {
  private layers: DenseLayer[] = [];
  private isTrained: boolean = false;

  constructor(
    private architecture: Array<{
      size: number;
      activation?: 'relu' | 'sigmoid' | 'linear';
    }>
  ) {
    // Build network layers
    for (let i = 1; i < architecture.length; i++) {
      const inputSize = architecture[i - 1].size;
      const outputSize = architecture[i].size;
      const activation = architecture[i].activation || 'relu';
      
      this.layers.push(new DenseLayer(inputSize, outputSize, activation));
    }
  }

  async fit(data: number[][], targets: number[][]): Promise<void> {
    const epochs = 100;
    const learningRate = 0.01;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < data.length; i++) {
        const input = data[i];
        const target = targets[i];

        // Forward pass
        const prediction = this.forward(input);
        
        // Calculate loss (MSE)
        const loss = prediction.reduce((sum, pred, j) => 
          sum + Math.pow(pred - target[j], 2), 0) / prediction.length;
        totalLoss += loss;

        // Simplified backpropagation (gradient descent)
        const outputError = prediction.map((pred, j) => pred - target[j]);
        this.backward(input, outputError, learningRate);
      }

      // Log progress occasionally
      if (epoch % 20 === 0) {
        logger.info(`Training epoch ${epoch}`, { loss: totalLoss / data.length });
      }
    }

    this.isTrained = true;
  }

  async predict(input: number[]): Promise<number[]> {
    if (!this.isTrained) {
      throw new Error('Model must be trained before prediction');
    }
    
    return this.forward(input);
  }

  private forward(input: number[]): number[] {
    let output = input;
    for (const layer of this.layers) {
      output = layer.forward(output);
    }
    return output;
  }

  private backward(
    input: number[], 
    outputError: number[], 
    learningRate: number
  ): void {
    // Simplified backpropagation - only updates output layer
    if (this.layers.length > 0) {
      const lastLayerIndex = this.layers.length - 1;
      let layerInput = input;
      
      // Get input to the last layer
      for (let i = 0; i < lastLayerIndex; i++) {
        layerInput = this.layers[i].forward(layerInput);
      }
      
      this.layers[lastLayerIndex].updateWeights(layerInput, outputError, learningRate);
    }
  }

  async evaluate(testData: number[][], testTargets: number[][]): Promise<ModelMetrics> {
    const predictions = await Promise.all(
      testData.map((input: any) => this.predict(input))
    );

    // Calculate MSE and R2 for each output dimension
    const numOutputs = testTargets[0].length;
    let totalMse = 0;
    let totalR2 = 0;

    for (let dim = 0; dim < numOutputs; dim++) {
      const actual = testTargets.map((target: any) => target[dim]);
      const predicted = predictions.map((pred: any) => pred[dim]);
      
      const metrics = calculateMetrics(actual, predicted);
      totalMse += metrics.mse;
      totalR2 += metrics.r2;
    }

    return {
      mse: totalMse / numOutputs,
      rmse: Math.sqrt(totalMse / numOutputs),
      r2: totalR2 / numOutputs
    };
  }

  save(): string {
    const modelData = {
      architecture: this.architecture,
      layers: this.layers.map((layer: any) => layer.getWeights()),
      isTrained: this.isTrained
    };
    
    return JSON.stringify(modelData);
  }

  load(modelData: string): void {
    const data = JSON.parse(modelData);
    this.architecture = data.architecture;
    this.isTrained = data.isTrained;
    
    // Rebuild layers with loaded weights
    this.layers = [];
    for (let i = 1; i < this.architecture.length; i++) {
      const inputSize = this.architecture[i - 1].size;
      const outputSize = this.architecture[i].size;
      const activation = this.architecture[i].activation || 'relu';
      
      const layer = new DenseLayer(inputSize, outputSize, activation);
      const layerData = data.layers[i - 1];
      layer.setWeights(layerData.weights, layerData.biases);
      
      this.layers.push(layer);
    }
  }
}

/**
 * Linear Regression Model
 */
export class LinearRegressionModel implements MLModel<number[], number> {
  private weights: number[] = [];
  private bias: number = 0;
  private isTrainedFlag: boolean = false;

  async fit(data: number[][], targets: number[]): Promise<void> {
    if (data.length === 0 || data.length !== targets.length) {
      throw new Error('Invalid training data');
    }

    const features = data[0].length;
    
    // Add bias term to features
    const X = data.map((row: any) => [1, ...row]); // Add column of 1s for bias
    
    // Normal equation: weights = (X^T * X)^(-1) * X^T * y
    const XTranspose = this.transpose(X);
    const XTX = this.matrixMultiply(XTranspose, X);
    const XTXInverse = this.matrixInverse(XTX);
    const XTy = this.matrixVectorMultiply(XTranspose, targets);
    
    const weights = this.matrixVectorMultiply(XTXInverse, XTy);
    
    this.bias = weights[0];
    this.weights = weights.slice(1);
    this.isTrainedFlag = true;
  }

  async predict(input: number[]): Promise<number> {
    if (!this.isTrainedFlag) {
      throw new Error('Model must be trained before prediction');
    }

    let prediction = this.bias;
    for (let i = 0; i < input.length; i++) {
      prediction += input[i] * this.weights[i];
    }

    return prediction;
  }

  async evaluate(testData: number[][], testTargets: number[]): Promise<ModelMetrics> {
    const predictions = await Promise.all(
      testData.map((input: any) => this.predict(input))
    );

    return {
      ...calculateMetrics(testTargets, predictions)
    };
  }

  save(): string {
    return JSON.stringify({
      weights: this.weights,
      bias: this.bias,
      isTrainedFlag: this.isTrainedFlag
    });
  }

  load(modelData: string): void {
    const data = JSON.parse(modelData);
    this.weights = data.weights;
    this.bias = data.bias;
    this.isTrainedFlag = data.isTrainedFlag;
  }

  // Matrix operations helpers
  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map((row: any) => row[colIndex]));
  }

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < B.length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map((row: any) => 
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  private matrixInverse(matrix: number[][]): number[][] {
    const n = matrix.length;
    const identity = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
    
    const augmented = matrix.map((row, i) => [...row, ...identity[i]]);
    
    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Make diagonal element 1
      const divisor = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= divisor;
      }
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    // Extract inverse matrix
    return augmented.map((row: any) => row.slice(n));
  }
}

/**
 * K-Nearest Neighbors Model
 */
export class KNearestNeighbors implements MLModel<number[], number> {
  private trainingData: number[][] = [];
  private trainingTargets: number[] = [];

  constructor(private k: number = 5) {}

  async fit(data: number[][], targets: number[]): Promise<void> {
    this.trainingData = data.map((row: any) => [...row]);
    this.trainingTargets = [...targets];
  }

  async predict(input: number[]): Promise<number> {
    if (this.trainingData.length === 0) {
      throw new Error('Model must be trained before prediction');
    }

    // Calculate distances to all training points
    const distances = this.trainingData.map((trainPoint, index) => ({
      distance: euclideanDistance(input, trainPoint),
      target: this.trainingTargets[index]
    }));

    // Sort by distance and take k nearest
    distances.sort((a, b) => a.distance - b.distance);
    const kNearest = distances.slice(0, this.k);

    // Return average of k nearest targets (regression)
    const sum = kNearest.reduce((acc, neighbor) => acc + neighbor.target, 0);
    return sum / kNearest.length;
  }

  async evaluate(testData: number[][], testTargets: number[]): Promise<ModelMetrics> {
    const predictions = await Promise.all(
      testData.map((input: any) => this.predict(input))
    );

    return {
      ...calculateMetrics(testTargets, predictions)
    };
  }

  save(): string {
    return JSON.stringify({
      k: this.k,
      trainingData: this.trainingData,
      trainingTargets: this.trainingTargets
    });
  }

  load(modelData: string): void {
    const data = JSON.parse(modelData);
    this.k = data.k;
    this.trainingData = data.trainingData;
    this.trainingTargets = data.trainingTargets;
  }
}

/**
 * Decision Tree Node
 */
interface TreeNode {
  isLeaf: boolean;
  value?: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

/**
 * Simple Decision Tree for Regression
 */
export class DecisionTreeRegressor implements MLModel<number[], number> {
  private root: TreeNode | null = null;

  constructor(
    private maxDepth: number = 10,
    private minSamplesSplit: number = 2
  ) {}

  async fit(data: number[][], targets: number[]): Promise<void> {
    this.root = this.buildTree(data, targets, 0);
  }

  private buildTree(data: number[][], targets: number[], depth: number): TreeNode {
    // Base cases
    if (depth >= this.maxDepth || data.length < this.minSamplesSplit) {
      return {
        isLeaf: true,
        value: targets.reduce((sum, val) => sum + val, 0) / targets.length
      };
    }

    // Find best split
    const bestSplit = this.findBestSplit(data, targets);
    if (bestSplit.gain <= 0) {
      return {
        isLeaf: true,
        value: targets.reduce((sum, val) => sum + val, 0) / targets.length
      };
    }

    // Split data
    const leftIndices: number[] = [];
    const rightIndices: number[] = [];
    
    data.forEach((row, i) => {
      if (row[bestSplit.feature] <= bestSplit.threshold) {
        leftIndices.push(i);
      } else {
        rightIndices.push(i);
      }
    });

    const leftData = leftIndices.map((i: any) => data[i]);
    const leftTargets = leftIndices.map((i: any) => targets[i]);
    const rightData = rightIndices.map((i: any) => data[i]);
    const rightTargets = rightIndices.map((i: any) => targets[i]);

    return {
      isLeaf: false,
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: this.buildTree(leftData, leftTargets, depth + 1),
      right: this.buildTree(rightData, rightTargets, depth + 1)
    };
  }

  private findBestSplit(data: number[][], targets: number[]): {
    feature: number;
    threshold: number;
    gain: number;
  } {
    let bestGain = 0;
    let bestFeature = 0;
    let bestThreshold = 0;

    const parentVariance = this.calculateVariance(targets);

    for (let feature = 0; feature < data[0].length; feature++) {
      // Sort by feature values
      const sortedIndices = Array.from({ length: data.length }, (_, i) => i)
        .sort((a, b) => data[a][feature] - data[b][feature]);

      for (let i = 1; i < data.length; i++) {
        const threshold = (data[sortedIndices[i-1]][feature] + data[sortedIndices[i]][feature]) / 2;
        
        const leftTargets = sortedIndices.slice(0, i).map((idx: any) => targets[idx]);
        const rightTargets = sortedIndices.slice(i).map((idx: any) => targets[idx]);
        
        const leftWeight = leftTargets.length / targets.length;
        const rightWeight = rightTargets.length / targets.length;
        
        const weightedVariance = leftWeight * this.calculateVariance(leftTargets) +
                                rightWeight * this.calculateVariance(rightTargets);
        
        const gain = parentVariance - weightedVariance;
        
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }

    return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  }

  async predict(input: number[]): Promise<number> {
    if (!this.root) {
      throw new Error('Model must be trained before prediction');
    }
    
    return this.predictNode(input, this.root);
  }

  private predictNode(input: number[], node: TreeNode): number {
    if (node.isLeaf) {
      return node.value || 0;
    }
    
    if (input[node.feature!] <= node.threshold!) {
      return this.predictNode(input, node.left!);
    } else {
      return this.predictNode(input, node.right!);
    }
  }

  async evaluate(testData: number[][], testTargets: number[]): Promise<ModelMetrics> {
    const predictions = await Promise.all(
      testData.map((input: any) => this.predict(input))
    );

    return {
      ...calculateMetrics(testTargets, predictions)
    };
  }

  save(): string {
    return JSON.stringify({
      root: this.root,
      maxDepth: this.maxDepth,
      minSamplesSplit: this.minSamplesSplit
    });
  }

  load(modelData: string): void {
    const data = JSON.parse(modelData);
    this.root = data.root;
    this.maxDepth = data.maxDepth;
    this.minSamplesSplit = data.minSamplesSplit;
  }
}