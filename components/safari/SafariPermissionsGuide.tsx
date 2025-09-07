'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Mic, Settings, AlertCircle, CheckCircle } from 'lucide-react';

interface SafariPermissionsGuideProps {
  onPermissionsGranted?: () => void;
  onRetry?: () => void;
}

export default function SafariPermissionsGuide({ onPermissionsGranted, onRetry }: SafariPermissionsGuideProps) {
  const [isSafari, setIsSafari] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isAppleSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    setIsSafari(isAppleSafari);
  }, []);

  const testPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      onPermissionsGranted?.();
    } catch (error) {

    }
  };

  if (!isSafari) {
    return null; // Only show for Safari users
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Enable Camera & Microphone in Safari
            </h2>
            <p className="text-gray-600">
              Safari requires manual permission setup for video calling
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {/* Step 1: URL Bar Permission */}
            <div className={`border rounded-lg p-4 ${currentStep === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Check URL Bar Permissions</h3>
                  <p className="text-gray-700 mb-3">
                    Look for camera/microphone icons in Safari's address bar (near the reload button)
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Camera icon</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
                      <Mic className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Microphone icon</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click these icons and select "Allow" for both camera and microphone
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Safari Settings */}
            <div className={`border rounded-lg p-4 ${currentStep === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Safari Settings Method</h3>
                  <p className="text-gray-700 mb-3">If step 1 doesn't work, try Safari settings:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Go to <strong>Safari</strong> → <strong>Settings/Preferences</strong></li>
                    <li>Click <strong>Websites</strong> tab</li>
                    <li>Find <strong>Camera</strong> and <strong>Microphone</strong> in the left sidebar</li>
                    <li>Set <strong>localhost</strong> to <strong>Allow</strong> for both</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Step 3: System Preferences */}
            <div className={`border rounded-lg p-4 ${currentStep === 3 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">macOS System Settings</h3>
                  <p className="text-gray-700 mb-3">Check your Mac's privacy settings:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Open <strong>System Settings</strong> (or System Preferences)</li>
                    <li>Go to <strong>Privacy & Security</strong></li>
                    <li>Click <strong>Camera</strong> and ensure <strong>Safari</strong> is enabled</li>
                    <li>Click <strong>Microphone</strong> and ensure <strong>Safari</strong> is enabled</li>
                    <li>Restart Safari if needed</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={testPermissions}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Test Permissions
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Previous Step
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                disabled={currentStep === 3}
                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Next Step
              </button>
            </div>

            <button
              onClick={onRetry}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Video Call Again
            </button>
          </div>

          {/* Help Note */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Still having issues?</strong> Try using Chrome or Firefox for the best video calling experience. 
                  Safari's WebRTC implementation has some limitations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}