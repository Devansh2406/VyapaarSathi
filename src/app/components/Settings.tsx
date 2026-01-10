import { useState, useEffect } from 'react';
import {
    ArrowLeft, Store, MessageCircle, Box, Wallet, Users,
    Mic, Bell, Smartphone, Brain, Shield, Save,
    HelpCircle, Info, LogOut, ChevronRight
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { getFromDB, saveToDB, DB_KEYS, DEFAULT_SETTINGS } from '../../services/localDB';

interface SettingsProps {
    onNavigate: (screen: string) => void;
    onLogout: () => void;
}

export default function Settings({ onNavigate, onLogout }: SettingsProps) {

    // -- Unified Settings State --
    const [appSettings, setAppSettings] = useState(() => getFromDB(DB_KEYS.SETTINGS, DEFAULT_SETTINGS));

    // Persist Settings & Apply Side Effects
    useEffect(() => {
        saveToDB(DB_KEYS.SETTINGS, appSettings);

        // Apply Dark Mode
        if (appSettings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

    }, [appSettings]);

    const updateSetting = (key: string, value: any) => {
        setAppSettings(prev => ({ ...prev, [key]: value }));
    };

    const SectionHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
        <div className="flex items-start gap-4 mb-4 mt-6 px-1">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );

    const SettingRow = ({ label, subLabel, action }: { label: string, subLabel?: string, action: React.ReactNode }) => (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
                <div className="text-sm font-medium text-gray-800">{label}</div>
                {subLabel && <div className="text-xs text-gray-500 mt-0.5">{subLabel}</div>}
            </div>
            {action}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 mb-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')}>
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-6">

                {/* 1. Shop & Profile */}
                <section>
                    <SectionHeader icon={Store} title="Shop & Profile" description="Personalize the app for your shop" />
                    <Card className="p-4 space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">Logo</div>
                            <Button variant="outline" size="sm">Change Logo</Button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-gray-500">Shop Name</Label>
                                <Input
                                    value={appSettings.shopName}
                                    onChange={(e) => updateSetting('shopName', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Owner Name</Label>
                                <Input
                                    value={appSettings.ownerName}
                                    onChange={(e) => updateSetting('ownerName', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Mobile Number</Label>
                                <Input value={appSettings.mobile} disabled className="bg-gray-100" />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Address</Label>
                                <Input
                                    value={appSettings.address}
                                    onChange={(e) => updateSetting('address', e.target.value)}
                                />
                            </div>
                            <SettingRow
                                label="Business Hours"
                                subLabel={appSettings.businessHours}
                                action={<Button variant="ghost" size="sm" className="text-blue-600">Edit</Button>}
                            />
                        </div>
                    </Card>
                </section>

                {/* 2. WhatsApp Settings */}
                <section>
                    <SectionHeader icon={MessageCircle} title="WhatsApp Settings" description="Control order and message behavior" />
                    <Card className="p-4">
                        <div className={`p-3 rounded-lg flex items-center justify-between mb-4 ${appSettings.whatsappConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${appSettings.whatsappConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`text-sm font-medium ${appSettings.whatsappConnected ? 'text-green-700' : 'text-red-700'}`}>
                                    {appSettings.whatsappConnected ? 'WhatsApp Connected' : 'Disconnected'}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant={appSettings.whatsappConnected ? 'outline' : 'default'}
                                onClick={() => updateSetting('whatsappConnected', !appSettings.whatsappConnected)}
                            >
                                {appSettings.whatsappConnected ? 'Disconnect' : 'Connect'}
                            </Button>
                        </div>

                        <SettingRow
                            label="Auto-reply"
                            subLabel="Reply automatically to new messages"
                            action={<Switch checked={appSettings.autoReply} onCheckedChange={(v) => updateSetting('autoReply', v)} />}
                        />
                        <SettingRow label="Edit Auto-reply" action={<ChevronRight className="w-5 h-5 text-gray-400" />} />
                        <SettingRow
                            label="Order Confirmation"
                            subLabel="Send confirmation when order accepted"
                            action={<Switch checked={appSettings.orderConfirmation} onCheckedChange={(v) => updateSetting('orderConfirmation', v)} />}
                        />
                    </Card>
                </section>

                {/* 3. Inventory Preferences */}
                <section>
                    <SectionHeader icon={Box} title="Inventory Preferences" description="Customize stock management" />
                    <Card className="p-4">
                        <SettingRow
                            label="Low Stock Warning"
                            subLabel="Alert when stock < 10 units"
                            action={<Switch checked={appSettings.lowStockWarning} onCheckedChange={(v) => updateSetting('lowStockWarning', v)} />}
                        />
                        <SettingRow
                            label="Allow Partial Orders"
                            subLabel="Accept partial quantity if low stock"
                            action={<Switch checked={appSettings.allowPartialOrder} onCheckedChange={(v) => updateSetting('allowPartialOrder', v)} />}
                        />
                        <SettingRow
                            label="Auto Reorder Suggestions"
                            subLabel="AI suggests when to buy"
                            action={<Switch checked={appSettings.autoReorder} onCheckedChange={(v) => updateSetting('autoReorder', v)} />}
                        />
                    </Card>
                </section>

                {/* 4. Profit & Finance */}
                <section>
                    <SectionHeader icon={Wallet} title="Profit & Finance" description="Calculations and reports" />
                    <Card className="p-4">
                        <SettingRow
                            label="Show Real Profit"
                            subLabel="Hide/Show sensitive profit data"
                            action={<Switch checked={appSettings.showRealProfit} onCheckedChange={(v) => updateSetting('showRealProfit', v)} />}
                        />
                        <SettingRow
                            label="Include Credit in Profit"
                            subLabel="Count 'Udhaar' sales as profit"
                            action={<Switch checked={appSettings.includeCredit} onCheckedChange={(v) => updateSetting('includeCredit', v)} />}
                        />
                        <SettingRow label="Week Start Day" subLabel="Monday" action={<ChevronRight className="w-5 h-5 text-gray-400" />} />
                    </Card>
                </section>

                {/* 5. Customer & Credit */}
                <section>
                    <SectionHeader icon={Users} title="Customer & Credit" description="Manage risk and udhaar" />
                    <Card className="p-4">
                        <SettingRow label="Credit Risk Warnings" subLabel="Alert for customers with high debt" action={<Switch checked={true} />} />
                        <SettingRow
                            label="Auto-block Risky Customers"
                            subLabel="Prevent new orders if debt > limit"
                            action={<Switch checked={appSettings.blockRisky} onCheckedChange={(v) => updateSetting('blockRisky', v)} />}
                        />
                        <SettingRow label="Default Credit Limit" subLabel="₹2,000" action={<ChevronRight className="w-5 h-5 text-gray-400" />} />
                        <SettingRow
                            label="Enable QR Payments"
                            action={<Switch checked={appSettings.enableQRPayments} onCheckedChange={(v) => updateSetting('enableQRPayments', v)} />}
                        />
                    </Card>
                </section>

                {/* 6. Voice & Language */}
                <section>
                    <SectionHeader icon={Mic} title="Voice & Language" description="Input and language settings" />
                    <Card className="p-4">
                        <SettingRow
                            label="Voice Input"
                            subLabel="Use mic for search and entry"
                            action={<Switch checked={appSettings.voiceInput} onCheckedChange={(v) => updateSetting('voiceInput', v)} />}
                        />
                        <SettingRow label="App Language" subLabel={appSettings.language} action={<ChevronRight className="w-5 h-5 text-gray-400" />} />
                    </Card>
                </section>

                {/* 7. Notifications & Alerts */}
                <section>
                    <SectionHeader icon={Bell} title="Notifications & Alerts" description="Manage alerts" />
                    <Card className="p-4">
                        <SettingRow label="New WhatsApp Orders" action={<Switch checked={true} />} />
                        <SettingRow label="Low Stock Alerts" action={<Switch checked={true} />} />
                        <SettingRow label="Daily Summary" action={<Switch checked={true} />} />
                    </Card>
                </section>

                {/* 8. Appearance & UI */}
                <section>
                    <SectionHeader icon={Smartphone} title="Appearance & UI" description="UI and Theme" />
                    <Card className="p-4">
                        <SettingRow
                            label="Dark Mode"
                            action={<Switch checked={appSettings.darkMode} onCheckedChange={(v) => updateSetting('darkMode', v)} />}
                        />
                        <SettingRow label="Font Size" subLabel="Medium" action={<ChevronRight className="w-5 h-5 text-gray-400" />} />
                    </Card>
                </section>

                {/* 9. AI & Insights */}
                <section>
                    <SectionHeader icon={Brain} title="AI & Insights" description="Smart features" />
                    <Card className="p-4">
                        <SettingRow label="Enable AI Insights" action={<Switch checked={true} />} />
                        <SettingRow label="Demand Prediction" action={<Switch checked={true} />} />
                        <SettingRow label="Festival Alerts" action={<Switch checked={true} />} />
                    </Card>
                </section>

                {/* 10. Security & Privacy */}
                <section>
                    <SectionHeader icon={Shield} title="Security & Privacy" description="Protect your account" />
                    <Card className="p-4">
                        <SettingRow label="App Lock" subLabel="PIN / Biometric" action={<Switch checked={false} />} />
                        <SettingRow label="Logout All Devices" action={<Button variant="ghost" className="text-red-500 h-8">Logout</Button>} />
                    </Card>
                </section>

                {/* 11. Data & Export */}
                <section>
                    <SectionHeader icon={Save} title="Data & Export" description="Your data ownership" />
                    <Card className="p-4">
                        <SettingRow label="Backup Status" subLabel="Last backup: 2 hours ago" action={<Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Safe</Badge>} />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button variant="outline" className="text-xs">Export Sales</Button>
                            <Button variant="outline" className="text-xs">Export Inventory</Button>
                        </div>
                    </Card>
                </section>

                {/* 12. Help & Support */}
                <section>
                    <SectionHeader icon={HelpCircle} title="Help & Support" description="Get assistance" />
                    <Card className="p-4">
                        <SettingRow label="How to use App" action={<ChevronRight className="w-5 h-5 text-gray-400" />} />
                        <SettingRow label="Contact Support" action={<ChevronRight className="w-5 h-5 text-gray-400" />} />
                    </Card>
                </section>

                {/* 13. About App */}
                <section>
                    <SectionHeader icon={Info} title="About App" description="App details" />
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Version</span>
                            <span className="text-sm text-gray-500">2.4.0 (Beta)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Terms & Privacy</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mt-4 text-center text-xs text-gray-400">
                            Built with Google Technologies
                        </div>
                    </Card>
                </section>

                <div className="pt-4">
                    <Button onClick={onLogout} variant="destructive" className="w-full h-12 text-lg">
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </Button>
                </div>

            </div>
        </div>
    );
}
