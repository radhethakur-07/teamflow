import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Kanban, 
  Zap, 
  ShieldCheck, 
  Users, 
  Layout, 
  ChevronRight,
  Clock,
  Layers
} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-warm-50 text-warm-900 selection:bg-terracotta-100 selection:text-terracotta-600">
      {/* Public Navbar */}
      <header className="sticky top-0 z-30 bg-warm-50/90 backdrop-blur-md border-b border-warm-200 px-4 md:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center font-heading font-bold text-sm shadow-warm-sm">
            TF
          </div>
          <span className="font-heading font-extrabold text-lg text-warm-900 tracking-tight">
            TeamFlow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-warm-600">
          <a href="#features" className="hover:text-warm-900 transition-colors">Features</a>
          <a href="#aesthetic" className="hover:text-warm-900 transition-colors">Design Philosophy</a>
          <a href="#comparison" className="hover:text-warm-900 transition-colors">Why TeamFlow</a>
          <Link to="/status" className="hover:text-warm-900 transition-colors flex items-center gap-1 text-sage-600">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
            Infrastructure Status
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" rightIcon={ArrowRight}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 md:px-12 pt-16 md:pt-24 pb-16 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-100 border border-warm-200 text-xs font-semibold text-warm-700 shadow-warm-sm animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
          <span>The Anti-Sterile Project Platform</span>
          <span className="text-warm-400">&bull;</span>
          <span className="text-terracotta-600 font-bold">Built for Momentum</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-warm-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Project momentum, elevated by <span className="text-terracotta-500 underline decoration-terracotta-200 underline-offset-8">human warmth</span>.
        </h1>

        <p className="text-base sm:text-lg text-warm-500 max-w-2xl mx-auto font-normal leading-relaxed">
          Eschewing cold corporate blues, noisy dark-mode dashboards, and bloated menus. 
          TeamFlow unites real-time Kanban collaboration with a tactile, editorial aesthetic.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" rightIcon={ArrowRight} className="w-full sm:w-auto">
              Start Free Workspace
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Live Workspace Demo
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-warm-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sage-500" />
            Sub-100ms Socket.IO Sync
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sage-500" />
            4-Tier Role Governance (RBAC)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sage-500" />
            Zero Dummy Data or Fake UI
          </span>
        </div>

        {/* Interactive UI Showcase Mockup */}
        <div className="pt-10">
          <div className="bg-white rounded-3xl border border-warm-200 shadow-warm-lg p-4 md:p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-terracotta-500" />
                <span className="w-3 h-3 rounded-full bg-mustard-500" />
                <span className="w-3 h-3 rounded-full bg-sage-500" />
                <span className="ml-3 text-xs font-heading font-bold text-warm-800">
                  Acme Studio &mdash; Mobile Redesign Board
                </span>
              </div>
              <Badge variant="sage" size="sm" dot>Live Sync Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-warm-100/60 rounded-xl p-3 space-y-3 border border-warm-200/60">
                <div className="flex items-center justify-between text-xs font-bold text-warm-700">
                  <span>To Do</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-warm-200 text-warm-700">3</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-warm-200 shadow-warm-sm space-y-2">
                  <Badge variant="mustard" size="sm">High Priority</Badge>
                  <p className="text-xs font-semibold text-warm-900">Audit touch targets for WCAG 2.1 AA</p>
                  <div className="text-[10px] text-warm-400 flex justify-between">
                    <span>Due in 3d</span>
                    <span className="font-bold text-warm-700">Jane D.</span>
                  </div>
                </div>
              </div>

              <div className="bg-warm-100/60 rounded-xl p-3 space-y-3 border border-warm-200/60">
                <div className="flex items-center justify-between text-xs font-bold text-warm-700">
                  <span>In Progress</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-warm-200 text-warm-700">2</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-warm-200 shadow-warm-sm space-y-2">
                  <Badge variant="terracotta" size="sm">Urgent</Badge>
                  <p className="text-xs font-semibold text-warm-900">Implement Terracotta button tokens</p>
                  <div className="text-[10px] text-warm-400 flex justify-between">
                    <span>Due tomorrow</span>
                    <span className="font-bold text-warm-700">Alex R.</span>
                  </div>
                </div>
              </div>

              <div className="bg-warm-100/60 rounded-xl p-3 space-y-3 border border-warm-200/60">
                <div className="flex items-center justify-between text-xs font-bold text-warm-700">
                  <span>Done</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sage-100 text-sage-600 font-bold">5</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-warm-200 shadow-warm-sm space-y-2">
                  <Badge variant="sage" size="sm">Completed</Badge>
                  <p className="text-xs font-semibold text-warm-900 line-through text-warm-400">
                    Setup Vite with Plus Jakarta Sans
                  </p>
                  <div className="text-[10px] text-sage-600 font-medium">All 3 checks passed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="aesthetic" className="py-16 md:py-24 bg-white border-y border-warm-200 px-4 md:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-heading font-extrabold text-warm-900 tracking-tight">
              Crafted with Warmth, Not Glare
            </h2>
            <p className="text-sm text-warm-500 max-w-xl mx-auto">
              Our bespoke color harmony reduces eye fatigue during 8-hour sprint days while preserving high contrast and accessible readability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-warm-50 border border-warm-300 mx-auto" />
              <p className="text-xs font-bold text-warm-900">Warm Ivory</p>
              <code className="text-[10px] text-warm-400">#F8F5EF</code>
            </div>

            <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-terracotta-500 mx-auto" />
              <p className="text-xs font-bold text-warm-900">Terracotta</p>
              <code className="text-[10px] text-warm-400">#E98269</code>
            </div>

            <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sage-500 mx-auto" />
              <p className="text-xs font-bold text-warm-900">Sage Green</p>
              <code className="text-[10px] text-warm-400">#91A88C</code>
            </div>

            <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-mustard-500 mx-auto" />
              <p className="text-xs font-bold text-warm-900">Mustard</p>
              <code className="text-[10px] text-warm-400">#E9C995</code>
            </div>

            <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-lavender-500 mx-auto" />
              <p className="text-xs font-bold text-warm-900">Lavender</p>
              <code className="text-[10px] text-warm-400">#C9B8D9</code>
            </div>

            <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-charcoal-500 mx-auto" />
              <p className="text-xs font-bold text-warm-900">Warm Charcoal</p>
              <code className="text-[10px] text-warm-400">#554B43</code>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section id="comparison" className="py-16 md:py-24 px-4 md:px-12 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-heading font-extrabold text-warm-900 tracking-tight">
            How TeamFlow Compares
          </h2>
          <p className="text-sm text-warm-500 max-w-xl mx-auto">
            Engineered for high velocity without enterprise friction or template fatigue.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm-100/60 border-b border-warm-200 text-warm-700 font-heading font-bold">
                <th className="p-4">Capability</th>
                <th className="p-4 text-terracotta-600 font-extrabold">TeamFlow</th>
                <th className="p-4 text-warm-400">Traditional Jira</th>
                <th className="p-4 text-warm-400">Notion / Boards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100 text-warm-700">
              <tr>
                <td className="p-4 font-semibold text-warm-900">Real-Time Sync</td>
                <td className="p-4 text-sage-600 font-bold">&lt; 100ms Socket.IO</td>
                <td className="p-4 text-warm-400">Manual refresh needed</td>
                <td className="p-4 text-warm-400">Laggy sync on big docs</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-warm-900">Visual Aesthetic</td>
                <td className="p-4 text-terracotta-600 font-bold">Warm Editorial (Ivory / Terracotta)</td>
                <td className="p-4 text-warm-400">Cold corporate blue</td>
                <td className="p-4 text-warm-400">Sterile monochrome</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-warm-900">Setup Time</td>
                <td className="p-4 text-sage-600 font-bold">&lt; 60 seconds to first task</td>
                <td className="p-4 text-warm-400">Hours of IT provisioning</td>
                <td className="p-4 text-warm-400">Complex database config</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-warm-900">Role Governance</td>
                <td className="p-4 text-sage-600 font-bold">Built-in 4-tier RBAC</td>
                <td className="p-4 text-warm-400">Over-complex permission schemes</td>
                <td className="p-4 text-warm-400">All-or-nothing access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-warm-900 text-warm-100 px-4 md:px-12 py-12 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight">
            Ready to bring warmth and momentum to your team?
          </h3>
          <p className="text-xs text-warm-400">
            Deploy in seconds. No software installation required. Single source of truth.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link to="/register">
            <Button variant="primary" size="md" rightIcon={ArrowRight}>
              Create Workspace
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="md">
              View Demo
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-warm-800 text-xs text-warm-400 flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
          <p>&copy; 2026 TeamFlow SaaS. Built with React, Vite, Node.js, and MongoDB Atlas.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-warm-100">Sign In</Link>
            <Link to="/status" className="hover:text-warm-100">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
