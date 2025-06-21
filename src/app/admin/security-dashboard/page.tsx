'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SuspiciousActivity {
  ip: string;
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
  blockExpiry?: number;
}

interface SecurityStats {
  totalSuspiciousIPs: number;
  blockedIPs: number;
  activeThreats: number;
  lastHourRequests: number;
}

export default function SecurityDashboard() {
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalSuspiciousIPs: 0,
    blockedIPs: 0,
    activeThreats: 0,
    lastHourRequests: 0,
  });
  const [fallbackStatus, setFallbackStatus] = useState({
    redis: { available: true, status: 'connected' },
    memory: { active: false, size: 0, status: 'normal' },
    recommendation: 'Redis is working normally',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demo
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSecurityStats({
        totalSuspiciousIPs: 12,
        blockedIPs: 3,
        activeThreats: 2,
        lastHourRequests: 1247,
      });
      
      setSuspiciousActivities([
        {
          ip: '192.168.1.100',
          attempts: 75,
          lastAttempt: Date.now() - 300000,
          blocked: true,
          blockExpiry: Date.now() + 3300000,
        },
        {
          ip: '10.0.0.50',
          attempts: 45,
          lastAttempt: Date.now() - 180000,
          blocked: false,
        },
        {
          ip: '172.16.0.25',
          attempts: 120,
          lastAttempt: Date.now() - 600000,
          blocked: true,
          blockExpiry: Date.now() + 2700000,
        },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  // Check if block is expired
  const isBlockExpired = (blockExpiry?: number) => {
    if (!blockExpiry) return false;
    return Date.now() > blockExpiry;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading security dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🛡️ Security Dashboard</h1>
        <Button variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Redis Fallback Status */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">🔄 Redis Fallback Status</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">Redis Status</h3>
              <div className="flex items-center space-x-2">
                <Badge variant={fallbackStatus.redis.available ? "success" : "error"}>
                  {fallbackStatus.redis.status}
                </Badge>
                {!fallbackStatus.redis.available && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      const response = await fetch('/api/security/fallback-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'reconnect-redis' }),
                      });
                      if (response.ok) {
                        // Refresh status
                        window.location.reload();
                      }
                    }}
                  >
                    Reconnect
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Memory Fallback</h3>
              <div className="flex items-center space-x-2">
                <Badge variant={fallbackStatus.memory.active ? "warning" : "default"}>
                  {fallbackStatus.memory.active ? 'Active' : 'Inactive'}
                </Badge>
                {fallbackStatus.memory.active && (
                  <span className="text-sm text-gray-600">
                    {fallbackStatus.memory.size} keys
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Recommendation</h3>
              <p className="text-sm text-gray-600">
                {fallbackStatus.recommendation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-600">Suspicious IPs</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {securityStats.totalSuspiciousIPs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-600">Blocked IPs</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityStats.blockedIPs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-600">Active Threats</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {securityStats.activeThreats}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-600">Requests (1h)</h3>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {securityStats.lastHourRequests}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Activities Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Suspicious Activities</h2>
        </CardHeader>
        <CardContent>
          {suspiciousActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No suspicious activities detected
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">IP Address</th>
                    <th className="text-left p-2">Attempts</th>
                    <th className="text-left p-2">Last Attempt</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suspiciousActivities.map((activity) => (
                    <tr key={activity.ip} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">
                        {activity.ip}
                      </td>
                      <td className="p-2">
                        <Badge variant={activity.attempts > 100 ? "error" : activity.attempts > 50 ? "warning" : "default"}>
                          {activity.attempts}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm">
                        {formatTimestamp(activity.lastAttempt)}
                      </td>
                      <td className="p-2">
                        {activity.blocked ? (
                          <div className="space-y-1">
                            <Badge variant="error">Blocked</Badge>
                            {activity.blockExpiry && (
                              <div className="text-xs text-gray-500">
                                {isBlockExpired(activity.blockExpiry) ? (
                                  <span className="text-green-600">Block expired</span>
                                ) : (
                                  <>Until: {formatTimestamp(activity.blockExpiry)}</>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="warning">Monitoring</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {activity.blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => console.log('Unblock', activity.ip)}
                            >
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => console.log('Block', activity.ip)}
                            >
                              Block
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Security Settings</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Rate Limiting</h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex justify-between">
                  <span>• Orders:</span>
                  <span className="font-medium">5 requests/minute</span>
                </li>
                <li className="flex justify-between">
                  <span>• Auth:</span>
                  <span className="font-medium">10 requests/minute</span>
                </li>
                <li className="flex justify-between">
                  <span>• API:</span>
                  <span className="font-medium">100 requests/minute</span>
                </li>
                <li className="flex justify-between">
                  <span>• Public:</span>
                  <span className="font-medium">200 requests/minute</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Auto-blocking</h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex justify-between">
                  <span>• Threshold:</span>
                  <span className="font-medium">50 requests/minute</span>
                </li>
                <li className="flex justify-between">
                  <span>• Block duration:</span>
                  <span className="font-medium">1 hour</span>
                </li>
                <li className="flex justify-between">
                  <span>• Max devices per user:</span>
                  <span className="font-medium">5 devices</span>
                </li>
                <li className="flex justify-between">
                  <span>• Session timeout:</span>
                  <span className="font-medium">30 minutes</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 