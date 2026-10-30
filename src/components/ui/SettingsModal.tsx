'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  User,
  Key,
  Globe,
  Palette,
  Zap,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  TestTube,
  Shield,
  Bell,
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  Settings,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { ColorPicker } from './ColorPicker';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    settings, 
    updateSettings, 
    aiProviders, 
    activeProviderId, 
    activeModelId,
    addAIProvider,
    updateAIProvider,
    deleteAIProvider,
    setActiveProvider,
    setActiveModel,
  } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'appearance' | 'shortcuts' | 'advanced'>('general');
  const [newProvider, setNewProvider] = useState({
      name: '',
      type: 'custom' as const,
      apiKey: '',
      baseUrl: '',
    });
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', icon: User, label: 'General' },
    { id: 'ai', icon: Zap, label: 'AI Providers' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'shortcuts', icon: Zap, label: 'Shortcuts' },
    { id: 'advanced', icon: Settings, label: 'Advanced' },
  ];

  const handleTestProvider = async (providerId: string) => {
    setTestingProvider(providerId);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestingProvider(null);
  };

  const handleAddProvider = () => {
      if (!newProvider.name || !newProvider.apiKey) return;
      addAIProvider({
        id: `provider_${Date.now()}`,
        name: newProvider.name,
        type: newProvider.type,
        apiKey: newProvider.apiKey,
        baseUrl: newProvider.baseUrl || undefined,
        models: [{ id: 'default', name: 'Default Model', provider: newProvider.type, maxTokens: 4096, supportsVision: false, supportsFunctions: true }],
        enabled: true,
      });
      setNewProvider({ name: '', type: 'custom', apiKey: '', baseUrl: '' });
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl h-[85vh] bg-secondary border border-border rounded-xl shadow-xl overflow-hidden animate-slide-in-bottom flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'general' && <GeneralSettings settings={settings} onChange={updateSettings} />}
          {activeTab === 'ai' && (
            <AISettings
              providers={aiProviders}
              activeProviderId={activeProviderId}
              activeModelId={activeModelId}
              newProvider={newProvider}
              setNewProvider={setNewProvider}
              testingProvider={testingProvider}
              onAddProvider={handleAddProvider}
              onTestProvider={handleTestProvider}
              onSetActiveProvider={setActiveProvider}
              onSetActiveModel={setActiveModel}
              onUpdateProvider={updateAIProvider}
              onRemoveProvider={deleteAIProvider}
            />
          )}
          {activeTab === 'appearance' && <AppearanceSettings settings={settings} onChange={updateSettings} />}
          {activeTab === 'shortcuts' && <ShortcutsSettings settings={settings} onChange={updateSettings} />}
          {activeTab === 'advanced' && <AdvancedSettings settings={settings} onChange={updateSettings} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings({ settings, onChange }: { settings: any; onChange: (s: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Editor Behavior</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">Auto-save</p>
              <p className="text-sm text-muted-foreground">Automatically save changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => onChange({ autoSave: e.target.checked })}
              className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">Auto-save Interval</p>
              <p className="text-sm text-muted-foreground">Time between auto-saves (ms)</p>
            </div>
            <input
              type="number"
              value={settings.autoSaveInterval}
              onChange={(e) => onChange({ autoSaveInterval: parseInt(e.target.value) })}
              className="w-32 px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              min="5000"
              max="300000"
              step="5000"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">Show Grid by Default</p>
              <p className="text-sm text-muted-foreground">Display grid on new projects</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-input text-primary focus:ring-primary" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">Snap to Grid by Default</p>
              <p className="text-sm text-muted-foreground">Enable snapping on new projects</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-input text-primary focus:ring-primary" />
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Language & Region</h3>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={settings.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
          </select>
          <select className="px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>UTC</option>
            <option>Local</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function AISettings({
  providers,
  activeProviderId,
  activeModelId,
  newProvider,
  setNewProvider,
  testingProvider,
  onAddProvider,
  onTestProvider,
  onSetActiveProvider,
  onSetActiveModel,
  onUpdateProvider,
  onRemoveProvider,
  handleTestProvider,
  setActiveProvider,
  updateAIProvider,
  deleteAIProvider,
}: any) {
  const activeProvider = providers.find((p: any) => p.id === activeProviderId);

  return (
    <div className="space-y-6">
      {/* Active Provider */}
      <div className="p-4 bg-accent/50 rounded-lg border border-border">
        <h4 className="font-medium mb-3">Active Provider</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{activeProvider?.name || 'None selected'}</p>
              <p className="text-sm text-muted-foreground">Model: {activeModelId}</p>
            </div>
          </div>
          <select
            value={activeProviderId}
            onChange={(e) => onSetActiveProvider(e.target.value)}
            className="px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {providers.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Selection */}
      {activeProvider && (
        <div>
          <h4 className="font-medium mb-3">Model</h4>
          <select
            value={activeModelId}
            onChange={(e) => onSetActiveModel(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {activeProvider.models.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Providers List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">AI Providers</h3>
          <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-1" />
            Add Provider
          </button>
        </div>

        <div className="space-y-3">
          {providers.map((provider: any) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isActive={provider.id === activeProviderId}
              isTesting={testingProvider === provider.id}
              onTest={onTestProvider}
              onActivate={onSetActiveProvider}
              onUpdate={onUpdateProvider}
              onRemove={onRemoveProvider}
            />
          ))}
        </div>
      </div>

      {/* Add Provider Form */}
      <div className="p-4 bg-accent/50 rounded-lg border border-border">
        <h4 className="font-medium mb-3">Add Custom Provider</h4>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Provider Name (e.g., My Custom API)"
            value={newProvider.name}
            onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={newProvider.type}
            onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value as any })}
            className="w-full px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="custom">Custom OpenAI-Compatible</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google</option>
          </select>
          <input
            type="password"
            placeholder="API Key"
            value={newProvider.apiKey}
            onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Base URL (optional, for custom endpoints)"
            value={newProvider.baseUrl}
            onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={onAddProvider}
            disabled={!newProvider.name || !newProvider.apiKey}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Add Provider
          </button>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  isActive,
  isTesting,
  onTest,
  onActivate,
  onUpdate,
  onRemove,
}: any) {
  return (
    <div className={cn(
      'p-3 rounded-lg border transition-colors',
      isActive ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{provider.name}</p>
            <p className="text-sm text-muted-foreground">{provider.type} • {provider.models.length} models</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">Active</span>}
          <button
            onClick={() => onTest(provider.id)}
            disabled={isTesting}
            className="p-1.5 rounded hover:bg-accent transition-colors disabled:opacity-50"
            title="Test Connection"
          >
            {isTesting ? (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
          </button>
          {provider.id !== 'nvidia' && (
            <button
              onClick={() => onRemove(provider.id)}
              className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
              title="Remove Provider"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ settings, onChange }: { settings: any; onChange: (s: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {['dark', 'light', 'system'].map((theme) => (
            <button
              key={theme}
              onClick={() => onChange({ theme })}
              className={cn(
                'p-4 rounded-lg border-2 transition-all',
                settings.theme === theme ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {theme === 'dark' && <Moon className="w-6 h-6" />}
                {theme === 'light' && <Sun className="w-6 h-6" />}
                {theme === 'system' && <Monitor className="w-6 h-6" />}
              </div>
              <span className="text-sm font-medium capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Accent Color</h3>
        <ColorPicker value="#6366f1" onChange={(c) => {}} showAlpha={false} />
      </div>

      <div>
        <h3 className="font-medium mb-4">UI Density</h3>
        <div className="grid grid-cols-3 gap-3">
          {['comfortable', 'cozy', 'compact'].map((density) => (
            <button key={density} className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors">
              <span className="font-medium capitalize">{density}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShortcutsSettings({ settings, onChange }: { settings: any; onChange: (s: any) => void }) {
  const defaultShortcuts = [
    { action: 'Undo', keys: ['Ctrl', 'Z'], description: 'Undo last action' },
    { action: 'Redo', keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo last undone action' },
    { action: 'Copy', keys: ['Ctrl', 'C'], description: 'Copy selected elements' },
    { action: 'Paste', keys: ['Ctrl', 'V'], description: 'Paste elements' },
    { action: 'Duplicate', keys: ['Ctrl', 'D'], description: 'Duplicate selected elements' },
    { action: 'Delete', keys: ['Delete'], description: 'Delete selected elements' },
    { action: 'Select All', keys: ['Ctrl', 'A'], description: 'Select all elements' },
    { action: 'Group', keys: ['Ctrl', 'G'], description: 'Group selected elements' },
    { action: 'Ungroup', keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup selection' },
    { action: 'Zoom In', keys: ['Ctrl', '+'], description: 'Zoom in canvas' },
    { action: 'Zoom Out', keys: ['Ctrl', '-'], description: 'Zoom out canvas' },
    { action: 'Reset View', keys: ['Shift', '1'], description: 'Reset canvas view' },
    { action: 'Play/Pause', keys: ['Space'], description: 'Play or pause timeline' },
    { action: 'New Project', keys: ['Ctrl', 'N'], description: 'Create new project' },
    { action: 'Save', keys: ['Ctrl', 'S'], description: 'Save current project' },
    { action: 'Export', keys: ['Ctrl', 'E'], description: 'Export project' },
    { action: 'Toggle Grid', keys: ['G'], description: 'Show/hide grid' },
    { action: 'Toggle Snap', keys: ['Shift', 'G'], description: 'Enable/disable snap to grid' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Customize keyboard shortcuts (coming soon)</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-4">Action</th>
              <th className="pb-2 pr-4">Shortcut</th>
              <th className="pb-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {defaultShortcuts.map((shortcut) => (
              <tr key={shortcut.action} className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">{shortcut.action}</td>
                <td className="py-2 pr-4 font-mono">
                  {shortcut.keys.map((k, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-accent rounded text-xs mr-1">{k}</span>
                  ))}
                </td>
                <td className="py-2 text-muted-foreground">{shortcut.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdvancedSettings({ settings, onChange }: { settings: any; onChange: (s: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Experimental Features</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">Experimental AI Features</p>
              <p className="text-sm text-muted-foreground">Enable beta AI capabilities</p>
            </div>
            <input type="checkbox" className="w-5 h-5 rounded border-input text-primary focus:ring-primary" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">WebGL Rendering</p>
              <p className="text-sm text-muted-foreground">Use GPU acceleration for canvas</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-input text-primary focus:ring-primary" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">Offline Mode</p>
              <p className="text-sm text-muted-foreground">Enable offline editing (requires service worker)</p>
            </div>
            <input type="checkbox" className="w-5 h-5 rounded border-input text-primary focus:ring-primary" />
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Data Management</h3>
        <div className="space-y-3">
          <button className="w-full p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5" />
              <div>
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-muted-foreground">Download all projects and settings</p>
              </div>
            </div>
            <Download className="w-4 h-4" />
          </button>
          <button className="w-full p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5" />
              <div>
                <p className="font-medium">Import Data</p>
                <p className="text-sm text-muted-foreground">Restore from backup file</p>
              </div>
            </div>
            <Upload className="w-4 h-4" />
          </button>
          <button className="w-full p-3 rounded-lg border border-destructive/50 hover:bg-destructive/10 transition-colors text-left flex items-center justify-between text-destructive">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <div>
                <p className="font-medium">Reset All Settings</p>
                <p className="text-sm text-muted-foreground">Restore defaults (cannot be undone)</p>
              </div>
            </div>
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">About</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Anitom AI v1.0.0</p>
          <p>Built with Next.js, React, Tailwind CSS, and Framer Motion</p>
          <p>Powered by NVIDIA Nemotron 3.5 Super</p>
        </div>
      </div>
    </div>
  );
}