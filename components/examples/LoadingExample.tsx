'use client';

import React, { useState } from 'react';
import { LoadingSpinner, LoadingButton } from '@/components/LoadingSpinner';

export function LoadingExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<string[]>([]);

  const simulateLoading = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData(['Item 1', 'Item 2', 'Item 3']);
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Loading Spinner Examples</h2>
      
      {/* Basic Loading Spinner */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Loading Spinner</h3>
        <div className="flex space-x-4">
          <LoadingSpinner size="sm" text="Small" />
          <LoadingSpinner size="md" text="Medium" />
          <LoadingSpinner size="lg" text="Large" />
          <LoadingSpinner size="xl" text="Extra Large" />
        </div>
      </div>

      {/* Different Colors */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Colors</h3>
        <div className="flex space-x-4">
          <LoadingSpinner color="primary" text="Primary" />
          <LoadingSpinner color="secondary" text="Secondary" />
          <LoadingSpinner color="gray" text="Gray" />
          <div className="bg-gray-800 p-4 rounded">
            <LoadingSpinner color="white" text="White" />
          </div>
        </div>
      </div>

      {/* Loading Button */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Button</h3>
        <div className="flex space-x-4">
          <LoadingButton onClick={simulateLoading}>
            {isLoading ? 'Loading...' : 'Load Data'}
          </LoadingButton>
          <button
            onClick={simulateLoading}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load Data (Regular)'}
          </button>
        </div>
      </div>

      {/* Data Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Display</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Loading data..." />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded">
            {data.length > 0 ? (
              <ul className="space-y-2">
                {data.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No data loaded yet. Click the button above to load data.</p>
            )}
          </div>
        )}
      </div>

      {/* Custom Styling */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Styling</h3>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg">
          <LoadingSpinner 
            size="lg" 
            color="white" 
            text="Custom Background" 
            className="text-white"
          />
        </div>
      </div>
    </div>
  );
}
