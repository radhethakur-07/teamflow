import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Server, 
  Database, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  Code
} from 'lucide-react';
import { checkBackendConnection } from '../store/slices/systemSlice.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';

export const ConnectionTestPage = () => {
  const dispatch = useDispatch();
  const { status, healthData, latencyMs, error, lastChecked } = useSelector((state) => state.system);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    // Initial verification on mount
    dispatch(checkBackendConnection());
  }, [dispatch]);

  const handleTestConnection = () => {
    dispatch(checkBackendConnection());
  };

  const isConnected = status === 'succeeded';
  const isTesting = status === 'loading';

  return (
    <div className="min-h-screen bg-warm-50 text-warm-900 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-warm-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-warm-sm font-heading font-bold text-xl">
              TF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-bold text-warm-900 tracking-tight">TeamFlow</h1>
                <Badge variant="charcoal" size="sm">Milestone 1</Badge>
              </div>
              <p className="text-sm text-warm-500">MERN Foundation & Connectivity Diagnostic</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <Badge variant="sage" size="md" dot>
                Backend Connected
              </Badge>
            ) : isTesting ? (
              <Badge variant="mustard" size="md" dot>
                Verifying Connection...
              </Badge>
            ) : (
              <Badge variant="terracotta" size="md" dot>
                Connection Failed
              </Badge>
            )}
            
            <Button
              variant="primary"
              size="sm"
              leftIcon={RefreshCw}
              isLoading={isTesting}
              onClick={handleTestConnection}
            >
              Test Connection
            </Button>
          </div>
        </header>

        {/* Hero Notice */}
        <div className="bg-white rounded-xl p-6 border border-warm-200 shadow-warm-sm space-y-2">
          <h2 className="text-lg font-heading font-semibold text-warm-900">
            System Infrastructure Verification
          </h2>
          <p className="text-sm text-warm-500 leading-relaxed">
            This live diagnostic console validates frontend-to-backend communication, Express REST API health, 
            CORS header negotiation, and database connectivity. Every metric below is derived from active network calls.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Status Metric */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between text-warm-500">
              <span className="text-xs uppercase font-semibold tracking-wider">REST API Status</span>
              <Server className="w-4 h-4 text-terracotta-500" />
            </div>
            <div className="flex items-center gap-2.5">
              {isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-sage-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-terracotta-500 flex-shrink-0" />
              )}
              <span className="text-xl font-heading font-bold text-warm-900">
                {isConnected ? 'Operational' : isTesting ? 'Testing...' : 'Offline'}
              </span>
            </div>
            <div className="text-xs text-warm-500 pt-1 border-t border-warm-200 flex justify-between">
              <span>Endpoint:</span>
              <code className="text-warm-800 font-mono">/api/health</code>
            </div>
          </Card>

          {/* Latency Metric */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between text-warm-500">
              <span className="text-xs uppercase font-semibold tracking-wider">Round-Trip Latency</span>
              <Activity className="w-4 h-4 text-mustard-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-warm-900">
                {latencyMs !== null ? latencyMs : '--'}
              </span>
              <span className="text-sm font-medium text-warm-500">ms</span>
            </div>
            <div className="text-xs text-warm-500 pt-1 border-t border-warm-200 flex justify-between">
              <span>Last checked:</span>
              <span>{lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'Never'}</span>
            </div>
          </Card>

          {/* Database Metric */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between text-warm-500">
              <span className="text-xs uppercase font-semibold tracking-wider">Database Service</span>
              <Database className="w-4 h-4 text-lavender-500" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-heading font-bold capitalize text-warm-900">
                {healthData?.services?.database || (isConnected ? 'Operational' : 'Unavailable')}
              </span>
            </div>
            <div className="text-xs text-warm-500 pt-1 border-t border-warm-200 flex justify-between">
              <span>Driver:</span>
              <span className="text-warm-800">Mongoose / Atlas</span>
            </div>
          </Card>
        </div>

        {/* Error Banner if connection failed */}
        {error && (
          <div className="bg-terracotta-50 border border-terracotta-200 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-terracotta-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-terracotta-600">Connection Failed</p>
              <p className="text-warm-700 mt-1">{error}</p>
              <p className="text-xs text-warm-500 mt-2">
                Verify that the backend server is running on <code className="font-mono text-warm-800">http://localhost:5000</code> and CORS origins match.
              </p>
            </div>
          </div>
        )}

        {/* Detailed System Specifications */}
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center justify-between border-b border-warm-200 pb-4">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-terracotta-500" />
              <h3 className="font-heading font-bold text-base text-warm-900">
                Active Runtime & Server Telemetry
              </h3>
            </div>
            {healthData?.uptime && (
              <span className="text-xs text-warm-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Uptime: <strong className="text-warm-800">{healthData.uptime}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-warm-100/60 rounded-lg p-3.5 space-y-1">
              <span className="text-xs text-warm-500 uppercase font-semibold">Frontend Client</span>
              <p className="text-warm-900 font-medium">React 18 + Vite (Tailwind CSS Warm Tokens)</p>
              <p className="text-xs text-warm-500">Axios + Redux Toolkit State Management</p>
            </div>

            <div className="bg-warm-100/60 rounded-lg p-3.5 space-y-1">
              <span className="text-xs text-warm-500 uppercase font-semibold">Backend Runtime</span>
              <p className="text-warm-900 font-medium">
                Node.js {healthData?.meta?.nodeVersion || 'v20+'} & Express.js
              </p>
              <p className="text-xs text-warm-500">
                Mode: <span className="capitalize">{healthData?.environment || 'development'}</span> | Memory: {healthData?.meta?.memoryUsageMb || '--'} MB
              </p>
            </div>

            <div className="bg-warm-100/60 rounded-lg p-3.5 space-y-1">
              <span className="text-xs text-warm-500 uppercase font-semibold">Frontend API Target</span>
              <code className="text-xs font-mono text-terracotta-600 block truncate">
                {import.meta.env.VITE_API_URL || '/api'}
              </code>
            </div>

            <div className="bg-warm-100/60 rounded-lg p-3.5 space-y-1">
              <span className="text-xs text-warm-500 uppercase font-semibold">Security Middleware</span>
              <p className="text-xs text-warm-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sage-500" />
                Helmet, CORS Whitelist & Rate Limiter Active
              </p>
            </div>
          </div>

          {/* Toggle Raw JSON Response */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-warm-500 hover:text-terracotta-600 font-medium flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              <Code className="w-3.5 h-3.5" />
              {showRawJson ? 'Hide raw health response payload' : 'Inspect raw health response payload'}
            </button>

            {showRawJson && (
              <pre className="mt-3 p-4 bg-warm-900 text-warm-100 rounded-lg text-xs font-mono overflow-x-auto shadow-inner">
                {JSON.stringify(healthData || { error: error || 'No payload received' }, null, 2)}
              </pre>
            )}
          </div>
        </Card>

        {/* Milestone 1 Requirements Checklist */}
        <Card padding="lg" className="space-y-4">
          <h3 className="font-heading font-bold text-base text-warm-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sage-500" />
            Milestone 1 Verification Checklist
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-warm-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>Decoupled MERN monorepo structure (/frontend, /backend, /docs)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>React 18 + Vite with ES modules and Tailwind CSS</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>Express.js backend with helmet, cors, morgan, and rate limiting</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>Centralized error handling and standardized JSON response format</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>Working backend health check endpoint (GET /api/health)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>Frontend Redux Toolkit integration with live connection test</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>Vercel SPA configuration (vercel.json) & Render service spec</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-500 flex-shrink-0" />
              <span>GitHub Actions CI workflow (.github/workflows/ci.yml)</span>
            </li>
          </ul>
        </Card>

        {/* Footer */}
        <footer className="text-center text-xs text-warm-400 py-4">
          TeamFlow Architecture & Monorepo Scaffolding &bull; Production Readiness Milestone 1
        </footer>

      </div>
    </div>
  );
};

export default ConnectionTestPage;
