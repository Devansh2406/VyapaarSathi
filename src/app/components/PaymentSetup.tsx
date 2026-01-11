import { useState, useRef } from 'react';
import { ArrowRight, Wallet, CheckCircle2, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentSetupProps {
    onFinish: () => void;
}

export interface UPIConfig {
    id: string;
    appName: string;
    customName: string; // e.g. "Shop GPay", "Personal"
    qrImage: string; // Base64 string
    upiId?: string; // Optional text ID
}

const SUPPORTED_APPS = [
    "Google Pay",
    "PhonePe",
    "Paytm",
    "BHIM",
    "Amazon Pay",
    "Other"
];

export default function PaymentSetup({ onFinish }: PaymentSetupProps) {
    const [step, setStep] = useState<'count' | 'upload'>('count');
    const [qrCount, setQrCount] = useState<number>(1);
    const [configs, setConfigs] = useState<UPIConfig[]>([]);

    // Refs for file inputs to trigger them programmatically if needed
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleCountSubmit = () => {
        if (qrCount < 1) {
            toast.error("Please select at least 1 QR code.");
            return;
        }
        // Initialize empty configs
        const initialConfigs = Array.from({ length: qrCount }).map(() => ({
            id: crypto.randomUUID(),
            appName: "Google Pay",
            customName: "",
            qrImage: ""
        }));
        setConfigs(initialConfigs);
        setStep('upload');
    };

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) { // 500KB limit warning
            toast.warning("Image is large. Passing 500KB might slow down the app.");
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            updateConfig(index, 'qrImage', base64);
        };
        reader.readAsDataURL(file);
    };

    const updateConfig = (index: number, field: keyof UPIConfig, value: string) => {
        const newConfigs = [...configs];
        newConfigs[index] = { ...newConfigs[index], [field]: value };
        setConfigs(newConfigs);
    };

    const handleSave = () => {
        // Validation
        const invalid = configs.find((c, i) => !c.qrImage || !c.customName);
        if (invalid) {
            toast.error("Please fill in all details and upload QR images for all entries.");
            return;
        }

        // Save to local storage
        localStorage.setItem('upi_config', JSON.stringify(configs));
        toast.success("Payment setup complete!");
        onFinish();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Payments</h1>
                    <p className="text-gray-500">Configure your UPI QR codes to receive payments easily.</p>
                </div>

                <Card className="p-6 bg-white shadow-xl rounded-2xl border-0">
                    <AnimatePresence mode="wait">
                        {step === 'count' ? (
                            <motion.div
                                key="count"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-4">
                                        How many UPI QR codes do you want to add?
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQrCount(Math.max(1, qrCount - 1))}
                                            className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-900 border border-gray-100">
                                            {qrCount}
                                        </div>
                                        <button
                                            onClick={() => setQrCount(Math.min(5, qrCount + 1))}
                                            className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 text-center">You can add up to 5 QR codes.</p>
                                </div>

                                <Button
                                    onClick={handleCountSubmit}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg"
                                >
                                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {configs.map((config, index) => (
                                        <div key={config.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    QR Code #{index + 1}
                                                </span>
                                                {configs.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            const newC = configs.filter((_, i) => i !== index);
                                                            setConfigs(newC);
                                                            if (newC.length === 0) setStep('count');
                                                        }}
                                                        className="text-red-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                                        UPI App <span className="text-red-500">*</span>
                                                    </label>
                                                    <Select
                                                        value={config.appName}
                                                        onValueChange={(val) => updateConfig(index, 'appName', val)}
                                                    >
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Select App" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SUPPORTED_APPS.map(app => (
                                                                <SelectItem key={app} value={app}>{app}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                                        Display Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input
                                                        placeholder="e.g. Shop GPay, Personal PhonePe"
                                                        value={config.customName}
                                                        onChange={(e) => updateConfig(index, 'customName', e.target.value)}
                                                        className="bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 block mb-1">
                                                        Upload QR Image <span className="text-red-500">*</span>
                                                    </label>
                                                    <div
                                                        onClick={() => fileInputRefs.current[index]?.click()}
                                                        className={`
                              border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors
                              ${config.qrImage ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 bg-white'}
                            `}
                                                    >
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            ref={el => fileInputRefs.current[index] = el}
                                                            onChange={(e) => handleImageUpload(index, e)}
                                                        />
                                                        {config.qrImage ? (
                                                            <div className="relative w-full h-32 flex items-center justify-center">
                                                                <img src={config.qrImage} alt="QR Preview" className="h-full object-contain rounded-lg" />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                                                    <span className="bg-white text-xs px-2 py-1 rounded shadow">Change</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                                <span className="text-sm text-gray-500">Click to upload image</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep('count')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Finish Setup <CheckCircle2 className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}
