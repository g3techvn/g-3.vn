'use client';

import { useAuth } from '@/features/auth/AuthProvider';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface ApiTestResult {
  status?: number;
  ok?: boolean;
  data?: any;
  error?: string;
}

interface SessionInfo {
  hasSession: boolean;
  user?: {
    id: string;
    email?: string;
    phone?: string;
    metadata?: any;
  } | null;
  error?: string;
}

export default function TestAuthPage() {
  const { user, loading, error } = useAuth();
  const [apiTest, setApiTest] = useState<ApiTestResult | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  console.log('🧪 TestAuth - Current state:', { user, loading, error });

  // Test API call
  const testAPI = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      setApiTest({
        status: response.status,
        ok: response.ok,
        data
      });
    } catch (err) {
      setApiTest({
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  // Get session info
  const getSessionInfo = async () => {
    try {
      const supabase = createBrowserClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      setSessionInfo({
        hasSession: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          metadata: session.user.user_metadata
        } : null,
        error: error?.message
      });
    } catch (err) {
      setSessionInfo({
        hasSession: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  // Quick diagnostic for Supabase connection
  const testConnection = async () => {
    console.log('🔗 Testing Supabase connection...');
    
    try {
      const supabase = createBrowserClient();
      if (!supabase) {
        console.log('❌ Cannot create Supabase client');
        return;
      }
      
      console.log('✅ Supabase client created');
      
      // Test simple auth check
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = Date.now();
      
      console.log(`⏱️ Session check took ${endTime - startTime}ms`);
      console.log('📋 Session result:', { hasSession: !!data.session, error: error?.message });
      
    } catch (error) {
      console.log('❌ Connection test failed:', error);
    }
  };

  // Force clear auth state for debugging
  const forceAuthReset = async () => {
    try {
      const supabase = createBrowserClient();
      if (supabase) {
        // Clear all auth data
        await supabase.auth.signOut();
        localStorage.removeItem('supabase.auth.token');
        localStorage.clear(); // Clear all localStorage
        
        // Force reload the page
        window.location.reload();
      }
    } catch (error) {
      console.log('Error during force reset:', error);
    }
  };

  // Manual auth check trigger
  const authContext = useAuth();
  
  const manualAuthCheck = () => {
    console.log('🔄 Manual auth check triggered');
    if (authContext.checkAuth) {
      authContext.checkAuth();
    }
  };

  // Force sync session from Supabase to AuthProvider
  const forceSyncSession = async () => {
    console.log('🔄 Force syncing session...');
    try {
      const supabase = createBrowserClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        console.log('✅ Session found, triggering auth check...');
        // Trigger auth state change manually
        await authContext.checkAuth();
      } else {
        console.log('❌ No session to sync');
      }
    } catch (error) {
      console.log('Error syncing session:', error);
    }
  };

  const testAdminOrdersAPI = async () => {
    try {
      console.log('🧪 Testing admin orders API...');
      
      const supabase = createBrowserClient();
      const session = await supabase.auth.getSession();
      console.log('🧪 Session for API test:', {
        hasSession: !!session.data.session,
        hasToken: !!session.data.session?.access_token,
        userEmail: session.data.session?.user?.email
      });

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session.data.session?.access_token) {
        headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
      }

      const response = await fetch('/api/admin/orders?page=1&limit=10', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      const data = await response.json();
      
      console.log('🧪 Admin orders API test result:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

      setMessages(prev => [
        ...prev,
        `Admin Orders API Test: ${response.status} - ${JSON.stringify(data, null, 2)}`
      ]);
    } catch (error) {
      console.error('🧪 Admin orders API test error:', error);
      setMessages(prev => [
        ...prev,
        `Admin Orders API Error: ${error}`
      ]);
    }
  };

  useEffect(() => {
    // Run connection test on mount
    testConnection();
    getSessionInfo();
    if (user) {
      testAPI();
    }
  }, [user]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">🧪 Auth Test Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AuthProvider State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-blue-600">AuthProvider State</h2>
            <div className="space-y-2">
              <div className={`p-2 rounded ${loading ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <strong>Loading:</strong> {loading ? '🔄 true' : '✅ false'}
              </div>
              
              <div className={`p-2 rounded ${error ? 'bg-red-100' : 'bg-gray-100'}`}>
                <strong>Error:</strong> {error ? `❌ ${error}` : '✅ null'}
              </div>
              
              <div className={`p-2 rounded ${user ? 'bg-green-100' : 'bg-gray-100'}`}>
                <strong>User:</strong> {user ? '✅ Authenticated' : '❌ null'}
              </div>
              
              {user && (
                <div className="mt-4 p-3 bg-green-50 rounded border">
                  <strong>User Details:</strong>
                  <pre className="text-sm mt-2 whitespace-pre-wrap">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-purple-600">Supabase Session</h2>
            <button 
              onClick={getSessionInfo}
              className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🔄 Refresh Session
            </button>
            
            {sessionInfo && (
              <div className="space-y-2">
                <div className={`p-2 rounded ${sessionInfo.hasSession ? 'bg-green-100' : 'bg-red-100'}`}>
                  <strong>Has Session:</strong> {sessionInfo.hasSession ? '✅ Yes' : '❌ No'}
                </div>
                
                {sessionInfo.user && (
                  <div className="p-3 bg-blue-50 rounded border">
                    <strong>Session User:</strong>
                    <pre className="text-sm mt-2 whitespace-pre-wrap">
                      {JSON.stringify(sessionInfo.user, null, 2)}
                    </pre>
                  </div>
                )}
                
                {sessionInfo.error && (
                  <div className="p-2 bg-red-100 rounded">
                    <strong>Session Error:</strong> {sessionInfo.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* API Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-green-600">API Test (/api/user)</h2>
            <button 
              onClick={testAPI}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🧪 Test API
            </button>
            
            {apiTest && (
              <div className="space-y-2">
                <div className={`p-2 rounded ${apiTest.ok ? 'bg-green-100' : 'bg-red-100'}`}>
                  <strong>Status:</strong> {apiTest.status} {apiTest.ok ? '✅' : '❌'}
                </div>
                
                {apiTest.data && (
                  <div className="p-3 bg-gray-50 rounded border">
                    <strong>Response:</strong>
                    <pre className="text-sm mt-2 whitespace-pre-wrap">
                      {JSON.stringify(apiTest.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {apiTest.error && (
                  <div className="p-2 bg-red-100 rounded">
                    <strong>API Error:</strong> {apiTest.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Debug Console */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-600">Debug Console</h2>
            <div className="text-sm bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
              <p>🎯 Open browser console (F12) for detailed logs</p>
              <p>📋 Check Network tab for API requests</p>
              <p>🍪 Check Application → Cookies for auth cookies</p>
              <p>🔧 Check Application → Local Storage for data</p>
            </div>
          </div>
        </div>

        {/* Messages Display */}
        {messages.length > 0 && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">📨 Test Messages</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {messages.map((message, index) => (
                <div key={index} className="text-sm bg-white p-3 rounded border font-mono">
                  {message}
                </div>
              ))}
            </div>
            <button
              onClick={() => setMessages([])}
              className="mt-4 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Clear Messages
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {/* Debug Controls */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-3">🛠️ Debug Controls</h3>
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={manualAuthCheck}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                🔄 Force Auth Check
              </button>
              <button 
                onClick={forceAuthReset}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                🗑️ Clear All Auth Data
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                🔄 Reload Page
              </button>
              <button 
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                🔗 Test Connection
              </button>
              <button 
                onClick={forceSyncSession}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                🔄 Sync Session
              </button>
              <button
                onClick={testAdminOrdersAPI}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Test Admin Orders API
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-center">
            <a 
              href="/dang-nhap" 
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔑 Go to Login
            </a>
            <a 
              href="/tai-khoan" 
              className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              👤 Go to Account
            </a>
            <a 
              href="/" 
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🏠 Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 