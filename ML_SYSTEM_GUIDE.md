# Clerva ML System Guide 🧠

## Overview

The Clerva ML system provides intelligent engagement prediction using machine learning to help identify users at risk of disengagement and suggest personalized interventions.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Test the ML System

```bash
npm run test:ml
```

### 3. Train the Model

```bash
# Via API (requires admin access)
curl -X POST /api/ml/train-model \
  -H "Content-Type: application/json" \
  -d '{"includeCrossValidation": true}'
```

### 4. Get Engagement Prediction

```bash
# Via API
curl -X GET /api/ml/engagement-prediction
```

## 📊 System Architecture

### Core Components

1. **Engagement Predictor** (`lib/ml/engagement-predictor.ts`)
   - Neural network model for engagement prediction
   - Feature extraction from user data
   - Risk assessment and intervention recommendations

2. **Model Trainer** (`lib/ml/model-trainer.ts`)
   - Training data preparation
   - Model training and evaluation
   - Cross-validation and hyperparameter tuning

3. **API Routes**
   - `/api/ml/engagement-prediction` - Get predictions
   - `/api/ml/train-model` - Train/retrain models

4. **React Components**
   - `EngagementPrediction.tsx` - Display predictions

## 🎯 Features

### Engagement Prediction
- **Score Calculation**: 0-100 engagement score
- **Risk Assessment**: Low/Medium/High risk levels
- **Dropout Prediction**: Days until potential disengagement
- **Confidence Metrics**: Prediction confidence levels

### Feature Engineering
- **Study Behavior**: Session frequency, duration, streaks
- **Social Engagement**: Partnerships, reviews, messaging
- **Goal Progress**: Completion rates, active goals
- **Time Patterns**: Registration age, last activity, weekend usage
- **Performance Metrics**: Ratings, skill levels, subject count

### Model Capabilities
- **Neural Network**: 4-layer architecture with dropout
- **Feature Normalization**: Z-score standardization
- **Model Persistence**: Save/load trained models
- **Fallback System**: Rule-based predictions when ML unavailable

## 🔧 Usage Examples

### Basic Prediction

```typescript
import { EngagementPredictor } from '@/lib/ml/engagement-predictor';

const predictor = new EngagementPredictor();
await predictor.loadModel('./models/engagement-predictor-latest');

const features = EngagementPredictor.extractFeatures(user, sessions, goals, partnerships, reviews);
const prediction = await predictor.predictEngagement(features);

console.log(`Engagement Score: ${prediction.engagementScore}/100`);
console.log(`Risk Level: ${prediction.riskLevel}`);
console.log(`Dropout Prediction: ${prediction.predictedDropoutDays} days`);
```

### Model Training

```typescript
import { modelTrainer } from '@/lib/ml/model-trainer';

// Prepare training data
const trainingData = await modelTrainer.prepareTrainingData();

// Train model with custom config
const result = await modelTrainer.trainModel({
  epochs: 100,
  batchSize: 32,
  learningRate: 0.001,
  testSplit: 0.2
});

console.log(`Accuracy: ${(result.modelMetrics.accuracy * 100).toFixed(1)}%`);
console.log(`Training time: ${result.trainingTime}ms`);
```

### React Component

```tsx
import EngagementPrediction from '@/components/ml/EngagementPrediction';

function Dashboard() {
  return (
    <div>
      <EngagementPrediction 
        refreshInterval={300000} // 5 minutes
        showFeatures={true}
      />
    </div>
  );
}
```

## 📈 Model Performance

### Metrics
- **Accuracy**: Overall prediction accuracy
- **Precision**: True positive rate
- **Recall**: Sensitivity to positive cases
- **F1 Score**: Harmonic mean of precision and recall
- **MSE**: Mean squared error
- **MAE**: Mean absolute error

### Expected Performance
- **Accuracy**: 75-85% with sufficient training data
- **F1 Score**: 0.70-0.80 for balanced datasets
- **Training Time**: 30-60 seconds for 1000 data points
- **Prediction Time**: <100ms per prediction

## 🛠️ Configuration

### Training Configuration

```typescript
interface TrainingConfig {
  minDataPoints: number;        // Minimum data points required
  testSplit: number;           // Test set proportion (0.2)
  validationSplit: number;     // Validation set proportion (0.2)
  epochs: number;              // Training epochs (100)
  batchSize: number;           // Batch size (32)
  learningRate: number;        // Learning rate (0.001)
  earlyStoppingPatience: number; // Early stopping patience (10)
}
```

### Model Architecture

```typescript
// Neural Network Layers
tf.sequential({
  layers: [
    tf.layers.dense({ units: 64, activation: 'relu', inputShape: [18] }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 32, activation: 'relu' }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 16, activation: 'relu' }),
    tf.layers.dense({ units: 1, activation: 'sigmoid' })
  ]
});
```

## 🔍 Feature Analysis

### Input Features (18 total)

1. **Study Behavior Features**
   - `totalStudyHours`: Total study time in hours
   - `averageSessionLength`: Average session duration in minutes
   - `sessionFrequency`: Sessions per week
   - `streakLength`: Current study streak in days
   - `completionRate`: Goal completion rate (0-1)

2. **Social Features**
   - `partnerCount`: Number of study partners
   - `groupParticipation`: Group participation level (0-1)
   - `messageFrequency`: Messages per week
   - `reviewCount`: Number of reviews received

3. **Goal Features**
   - `activeGoals`: Number of active goals
   - `goalCompletionRate`: Overall goal completion rate
   - `daysSinceLastGoal`: Days since last goal activity

4. **Time Features**
   - `daysSinceRegistration`: Days since account creation
   - `lastActivityDays`: Days since last activity
   - `weekendActivity`: Weekend study sessions count

5. **Performance Features**
   - `averageRating`: Average rating received
   - `skillLevel`: User skill level (1-4)
   - `subjectCount`: Number of subjects studied

### Feature Importance

The system calculates feature importance using correlation analysis:

```typescript
// Example feature importance ranking
[
  { feature: 'sessionFrequency', importance: 0.85 },
  { feature: 'streakLength', importance: 0.78 },
  { feature: 'goalCompletionRate', importance: 0.72 },
  { feature: 'lastActivityDays', importance: 0.68 },
  // ... more features
]
```

## 🚨 Risk Assessment

### Risk Levels

- **Low Risk** (Score: 70-100)
  - High engagement, consistent study habits
  - Minimal intervention needed

- **Medium Risk** (Score: 40-69)
  - Moderate engagement, some inconsistency
  - Gentle encouragement and recommendations

- **High Risk** (Score: 0-39)
  - Low engagement, risk of dropout
  - Active interventions and support

### Intervention Types

1. **Motivational Notifications**
   - Personalized encouragement messages
   - Achievement celebrations
   - Streak maintenance reminders

2. **Study Partner Recommendations**
   - Match with compatible study partners
   - Group study invitations
   - Social engagement opportunities

3. **Content Recommendations**
   - Personalized study materials
   - Difficulty-appropriate content
   - Learning path suggestions

4. **Goal Setting Support**
   - SMART goal creation assistance
   - Progress tracking reminders
   - Milestone celebrations

## 🔄 Model Lifecycle

### Training Pipeline

1. **Data Collection**
   - Extract user data from database
   - Calculate engagement features
   - Generate ground truth scores

2. **Data Preprocessing**
   - Feature normalization
   - Missing value handling
   - Outlier detection

3. **Model Training**
   - Neural network training
   - Hyperparameter optimization
   - Cross-validation

4. **Model Evaluation**
   - Performance metrics calculation
   - Feature importance analysis
   - Model validation

5. **Model Deployment**
   - Model saving
   - API integration
   - Monitoring setup

### Retraining Schedule

- **Automatic**: Weekly retraining with new data
- **Manual**: On-demand retraining via API
- **Triggered**: When performance drops below threshold

## 📊 Monitoring & Analytics

### Performance Tracking

```typescript
// Model performance metrics
{
  accuracy: 0.82,
  precision: 0.79,
  recall: 0.85,
  f1Score: 0.82,
  mse: 245.6,
  mae: 12.3
}
```

### Usage Analytics

- Prediction requests per day
- Average response time
- Error rates and types
- User engagement with predictions

### Model Health

- Training data quality metrics
- Feature distribution analysis
- Prediction confidence trends
- Model drift detection

## 🔧 API Reference

### Engagement Prediction API

**GET** `/api/ml/engagement-prediction`

```typescript
// Response
{
  engagementScore: 75,
  riskLevel: 'medium',
  predictedDropoutDays: 14,
  confidence: 0.85,
  recommendations: ['Try studying at your most productive time'],
  interventions: ['Send motivational notification'],
  features?: EngagementFeatures // if includeFeatures=true
}
```

**POST** `/api/ml/engagement-prediction`

```typescript
// Request
{
  userId?: string,
  includeRecommendations: boolean
}
```

### Model Training API

**POST** `/api/ml/train-model`

```typescript
// Request
{
  config?: TrainingConfig,
  includeCrossValidation?: boolean,
  includeHyperparameterTuning?: boolean
}

// Response
{
  success: true,
  message: 'Model trained successfully',
  result: TrainingResult
}
```

**GET** `/api/ml/train-model`

```typescript
// Response
{
  dataPoints: 1250,
  sufficientData: true,
  dataQuality: {
    averageEngagementScore: 65.2,
    scoreDistribution: {
      low: 150,
      medium: 800,
      high: 300
    }
  },
  recommendations: string[]
}
```

## 🧪 Testing

### Run All Tests

```bash
npm run test:ml
```

### Test Components

1. **Dependency Check**: Verify ML libraries are installed
2. **Feature Extraction**: Test feature calculation
3. **Model Training**: Test training pipeline
4. **Predictions**: Test prediction functionality
5. **API Endpoints**: Test API integration

### Test Data

The system includes mock data for testing:

```typescript
// Mock user data structure
{
  id: 'test-user-1',
  personalStudySessions: [...],
  goals: [...],
  partnerships: [...],
  reviews: [...]
}
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   # ML Configuration
   ML_MODEL_PATH=./models/engagement-predictor-latest
   ML_TRAINING_ENABLED=true
   ML_PREDICTION_ENABLED=true
   ```

2. **Model Storage**
   - Save models to persistent storage
   - Implement model versioning
   - Backup trained models

3. **Monitoring**
   - Set up performance alerts
   - Monitor prediction accuracy
   - Track API usage

### Scaling Considerations

- **Model Caching**: Cache trained models in memory
- **Batch Processing**: Process predictions in batches
- **Load Balancing**: Distribute prediction requests
- **Database Optimization**: Optimize feature extraction queries

## 🔒 Security & Privacy

### Data Protection

- **Feature Anonymization**: Remove PII from features
- **Model Security**: Secure model storage and access
- **API Authentication**: Require authentication for ML APIs
- **Data Retention**: Implement data retention policies

### Privacy Compliance

- **GDPR Compliance**: User data rights
- **Data Minimization**: Collect only necessary features
- **Transparency**: Explain prediction logic
- **User Control**: Allow users to opt out

## 📚 Best Practices

### Model Development

1. **Start Simple**: Begin with rule-based predictions
2. **Iterate Gradually**: Add ML features incrementally
3. **Monitor Performance**: Track accuracy and user feedback
4. **A/B Test**: Compare ML vs rule-based approaches

### Feature Engineering

1. **Domain Knowledge**: Use education-specific features
2. **Feature Selection**: Remove irrelevant features
3. **Normalization**: Standardize feature scales
4. **Validation**: Cross-validate feature importance

### Deployment

1. **Gradual Rollout**: Deploy to small user groups first
2. **Fallback Systems**: Maintain rule-based fallbacks
3. **Monitoring**: Set up comprehensive monitoring
4. **Documentation**: Keep deployment procedures updated

## 🐛 Troubleshooting

### Common Issues

1. **Model Not Found**
   ```bash
   # Train a new model
   curl -X POST /api/ml/train-model
   ```

2. **Insufficient Data**
   ```bash
   # Check data availability
   curl -X GET /api/ml/train-model
   ```

3. **Low Accuracy**
   - Collect more training data
   - Review feature engineering
   - Adjust model architecture

4. **Slow Predictions**
   - Optimize feature extraction
   - Cache model in memory
   - Use batch processing

### Debug Mode

Enable debug logging:

```typescript
// Set debug level
process.env.LOG_LEVEL = 'debug';

// Check logs
tail -f logs/ml-system.log
```

## 📞 Support

### Getting Help

1. **Documentation**: Check this guide first
2. **Tests**: Run `npm run test:ml` for diagnostics
3. **Logs**: Check application logs for errors
4. **Community**: Ask questions in the project repository

### Contributing

1. **Feature Requests**: Submit via GitHub issues
2. **Bug Reports**: Include logs and reproduction steps
3. **Code Contributions**: Follow the project's coding standards
4. **Documentation**: Help improve this guide

---

**Note**: This ML system is designed to enhance user engagement through intelligent predictions and personalized recommendations. Always prioritize user privacy and ensure transparent communication about how predictions are made.
