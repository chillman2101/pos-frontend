import React, { useState } from 'react';
import { Button } from '../components/common';

const TestAPI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealthEndpoint = async () => {
    setLoading(true);
    setResult('Testing health endpoint...\n');

    try {
      const response = await fetch('http://192.168.1.16:8080/health', {
        method: 'GET',
        mode: 'cors',
      });

      const data = await response.json();
      setResult(prev => prev + '\n✅ SUCCESS!\n' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(prev => prev + '\n❌ ERROR:\n' + error.message + '\n' + error.stack);
    } finally {
      setLoading(false);
    }
  };

  const testLoginEndpoint = async () => {
    setLoading(true);
    setResult('Testing login endpoint...\n');

    try {
      const response = await fetch('http://192.168.1.16:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          username: 'chillman2101',
          password: 'aditgr2101',
        }),
      });

      const data = await response.json();
      setResult(prev => prev + '\n✅ SUCCESS!\n' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(prev => prev + '\n❌ ERROR:\n' + error.message + '\n' + error.stack);
    } finally {
      setLoading(false);
    }
  };

  const testWithAxios = async () => {
    setLoading(true);
    setResult('Testing with axios config...\n');

    try {
      const api = await import('../api/axiosConfig');
      const response = await api.default.post('/auth/login', {
        username: 'chillman2101',
        password: 'aditgr2101',
      });

      setResult(prev => prev + '\n✅ SUCCESS!\n' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(prev => prev + '\n❌ ERROR:\n' + error.message + '\n' + JSON.stringify({
        message: error.message,
        code: error.code,
        request: error.request ? 'exists' : 'none',
        response: error.response ? error.response.status : 'none',
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>

        <div className="bg-white rounded-lg p-6 shadow mb-4">
          <h2 className="font-semibold mb-4">Network Info:</h2>
          <div className="text-sm space-y-1 bg-neutral-100 p-3 rounded">
            <p><strong>API URL:</strong> http://192.168.1.16:8080</p>
            <p><strong>Frontend URL:</strong> {window.location.href}</p>
            <p><strong>Online:</strong> {navigator.onLine ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow mb-4">
          <h2 className="font-semibold mb-4">Tests:</h2>
          <div className="space-y-3">
            <Button
              onClick={testHealthEndpoint}
              disabled={loading}
              fullWidth
            >
              Test 1: Health Endpoint (Simple GET)
            </Button>

            <Button
              onClick={testLoginEndpoint}
              disabled={loading}
              fullWidth
              variant="secondary"
            >
              Test 2: Login Endpoint (Direct Fetch)
            </Button>

            <Button
              onClick={testWithAxios}
              disabled={loading}
              fullWidth
              variant="success"
            >
              Test 3: Login with Axios Config
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="font-semibold mb-4">Results:</h2>
          <pre className="bg-neutral-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
            {result || 'Click a test button above...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestAPI;
