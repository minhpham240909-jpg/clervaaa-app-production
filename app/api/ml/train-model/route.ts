import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { modelTrainer } from '@/lib/ml/model-trainer';
import { logger } from '@/lib/logger';

// ============================================================================
// ML MODEL TRAINING API ROUTE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (only allow admin users to train models)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can implement your own admin check)
    const isAdmin = await checkAdminStatus(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      config,
      includeCrossValidation = false,
      includeHyperparameterTuning = false
    } = body;

    logger.info('Starting model training via API', { 
      user: session.user.email,
      config,
      includeCrossValidation,
      includeHyperparameterTuning
    });

    // Prepare training data
    const trainingData = await modelTrainer.prepareTrainingData();

    if (trainingData.length < 50) {
      return NextResponse.json({
        error: 'Insufficient training data',
        dataPoints: trainingData.length,
        minimumRequired: 50
      }, { status: 400 });
    }

    let result;

    // Hyperparameter tuning if requested
    if (includeHyperparameterTuning) {
      logger.info('Starting hyperparameter tuning');
      const tuningResult = await modelTrainer.hyperparameterTuning(trainingData);
      
      // Use best config for training
      result = await modelTrainer.trainModel(tuningResult.bestConfig);
      result.hyperparameterTuning = tuningResult;
    } else {
      // Train with provided or default config
      result = await modelTrainer.trainModel(config);
    }

    // Cross-validation if requested
    if (includeCrossValidation) {
      logger.info('Starting cross-validation');
      const cvResult = await modelTrainer.crossValidate(trainingData);
      result.crossValidation = cvResult;
    }

    logger.info('Model training completed successfully', {
      user: session.user.email,
      dataPoints: result.dataPoints,
      trainingTime: result.trainingTime,
      accuracy: result.modelMetrics.accuracy
    });

    return NextResponse.json({
      success: true,
      message: 'Model trained successfully',
      result
    });

  } catch (error) {
    logger.error('Error in model training API', error);
    return NextResponse.json(
      { 
        error: 'Model training failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await checkAdminStatus(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get training data statistics
    const trainingData = await modelTrainer.prepareTrainingData();

    return NextResponse.json({
      dataPoints: trainingData.length,
      sufficientData: trainingData.length >= 50,
      dataQuality: {
        averageEngagementScore: trainingData.reduce((sum, d) => sum + d.engagementScore, 0) / trainingData.length,
        scoreDistribution: {
          low: trainingData.filter((d: any) => d.engagementScore < 40).length,
          medium: trainingData.filter((d: any) => d.engagementScore >= 40 && d.engagementScore < 70).length,
          high: trainingData.filter((d: any) => d.engagementScore >= 70).length
        }
      },
      recommendations: generateTrainingRecommendations(trainingData)
    });

  } catch (error) {
    logger.error('Error in model training status API', error);
    return NextResponse.json(
      { error: 'Failed to get training status' },
      { status: 500 }
    );
  }
}

// Helper function to check admin status
async function checkAdminStatus(email: string): Promise<boolean> {
  // Implement your admin check logic here
  // For now, we'll allow any authenticated user (you should implement proper admin roles)
  return true;
}

// Helper function to generate training recommendations
function generateTrainingRecommendations(trainingData: any[]): string[] {
  const recommendations: string[] = [];

  if (trainingData.length < 100) {
    recommendations.push('Consider collecting more training data for better model performance');
  }

  const avgScore = trainingData.reduce((sum, d) => sum + d.engagementScore, 0) / trainingData.length;
  if (avgScore < 30) {
    recommendations.push('Training data shows low engagement scores - consider data quality');
  }

  const scoreDistribution = {
    low: trainingData.filter((d: any) => d.engagementScore < 40).length,
    medium: trainingData.filter((d: any) => d.engagementScore >= 40 && d.engagementScore < 70).length,
    high: trainingData.filter((d: any) => d.engagementScore >= 70).length
  };

  if (scoreDistribution.low > scoreDistribution.high * 2) {
    recommendations.push('Training data is imbalanced - consider data augmentation or class weighting');
  }

  return recommendations;
}
