import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Phone, AlertTriangle, CheckCircle, Clock, Send, CreditCard, Banknote, Percent, QrCode } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import BottomNav from './BottomNav';
import { toast } from 'sonner';

interface CreditManagementProps {
  onNavigate: (screen: string) => void;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  totalCredit: number;
  lastPayment: string;
  status: 'paid' | 'due' | 'overdue';
  transactions: { date: string; type: 'credit' | 'payment'; amount: number; description: string }[];
}

interface UPIConfig {
  id: string;
  appName: string;
  customName: string;
  qrImage: string;
}

export default function CreditManagement({ onNavigate }: CreditManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add Credit State
  const [showAddCreditDialog, setShowAddCreditDialog] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('Goods purchased');

  // Settle State
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'wave-off'>('cash');

  // QR Reminder State
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [upiConfigs, setUpiConfigs] = useState<UPIConfig[]>([]);
  const [selectedQrId, setSelectedQrId] = useState<string>('');

  // New Customer State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Initial State (Mock Data)
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: 'Ravi Kumar',
      phone: '+919876543210',
      totalCredit: 2500,
      lastPayment: '2026-01-05',
      status: 'overdue',
      transactions: [
        { date: '2026-01-09', type: 'credit', amount: 500, description: 'Groceries' },
      ]
    },
    {
      id: 2,
      name: 'Priya Sharma',
      phone: '+918765432109',
      totalCredit: 1200,
      lastPayment: '2026-01-08',
      status: 'due',
      transactions: []
    }
  ]);

  useEffect(() => {
    const savedConfigs = localStorage.getItem('upi_config');
    if (savedConfigs) {
      const parsed = JSON.parse(savedConfigs);
      setUpiConfigs(parsed);
      if (parsed.length > 0) {
        setSelectedQrId(parsed[0].id);
      }
    }
  }, []);

  const totalCreditDue = customers.reduce((sum, c) => sum + c.totalCredit, 0);

  const handleAddCustomer = () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      toast.error('Please enter name and phone number');
      return;
    }

    const newCustomer: Customer = {
      id: Date.now(),
      name: newCustomerName,
      phone: newCustomerPhone,
      totalCredit: 0,
      lastPayment: new Date().toISOString().split('T')[0],
      status: 'paid', // Default status for new customer
      transactions: []
    };

    setCustomers([newCustomer, ...customers]);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setShowAddDialog(false);
    toast.success('Customer added successfully!');
  };

  const handleSendReminder = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowQRDialog(true);
  };

  // Helper to convert Base64 to Blob
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCopyQR = async () => {
    const selectedConfig = upiConfigs.find(u => u.id === selectedQrId);
    if (!selectedConfig || !selectedConfig.qrImage) {
      toast.error("No QR code to copy");
      return;
    }

    try {
      const blob = await (await fetch(selectedConfig.qrImage)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success("QR Code copied! You can paste it anywhere.");
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Failed to copy image. Browser might not support it.");
    }
  };

  const handleShareOnWhatsApp = async () => {
    if (!selectedCustomer) return;

    const selectedConfig = upiConfigs.find(u => u.id === selectedQrId);
    const accountName = selectedConfig ? selectedConfig.customName : 'Kirana Store';

    // Updated text to imply image might need pasting
    const message = `Hello ${selectedCustomer.name}, ₹${selectedCustomer.totalCredit} payment is pending at Kirana Store.\n\nPlease pay to ${accountName}.\n(Scan attached QR or copy it)\n\nTotal Due: ₹${selectedCustomer.totalCredit}`;

    // 1. Try Mobile Native Share (Image + Text)
    if (selectedConfig && selectedConfig.qrImage && navigator.share && navigator.canShare) {
      try {
        const file = dataURLtoFile(selectedConfig.qrImage, 'payment-qr.png');
        if (navigator.canShare({ files: [file] })) {
          // Copy text to clipboard as backup (WhatsApp often drops caption on Android)
          try { await navigator.clipboard.writeText(message); } catch (e) { console.warn('Clipboard write failed', e); }

          await navigator.share({
            files: [file],
            title: 'Payment Reminder',
            text: message
          });
          toast.success(`Shared! (Message copied to clipboard - Paste if missing)`);
          setShowQRDialog(false);
          return;
        }
      } catch (error) {
        console.warn('Share API failed/cancelled, trying URL scheme', error);
      }
    }

    // 2. Desktop Fallback: Copy Image + Open WhatsApp
    let clipboardSuccess = false;
    if (selectedConfig && selectedConfig.qrImage) {
      try {
        const blob = await (await fetch(selectedConfig.qrImage)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        clipboardSuccess = true;
      } catch (e) {
        console.warn("Auto-copy failed", e);
      }
    }

    // Fallback: WhatsApp URL Scheme (Text Only)
    const url = `https://wa.me/${selectedCustomer.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    if (clipboardSuccess) {
      toast.info('QR Image copied! Please PASTE (Ctrl+V) it in the chat.', { duration: 5000 });
    } else {
      toast.success(`WhatsApp opened for ${selectedCustomer.name}`);
    }
    setShowQRDialog(false);
  };

  const handleOpenAddCredit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCreditAmount('');
    setCreditDescription('Goods purchased');
    setShowAddCreditDialog(true);
  };

  const handleConfirmAddCredit = () => {
    if (!selectedCustomer || !creditAmount) return;

    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const updatedCustomers = customers.map(c => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          totalCredit: c.totalCredit + amount,
          status: 'due',
          transactions: [
            {
              date: new Date().toISOString().split('T')[0],
              type: 'credit',
              amount: amount,
              description: creditDescription
            },
            ...c.transactions
          ]
        } as Customer;
      }
      return c;
    });

    setCustomers(updatedCustomers);
    setShowAddCreditDialog(false);
    toast.success(`Added ₹${amount} credit to ${selectedCustomer.name}`);
  };

  const handleOpenSettle = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSettleAmount(customer.totalCredit.toString());
    setPaymentMode('cash');
    setShowSettleDialog(true);
  };

  const handleConfirmSettle = () => {
    if (!selectedCustomer || !settleAmount) return;

    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedCustomer.totalCredit) {
      toast.error('Invalid amount');
      return;
    }

    const updatedCustomers = customers.map(c => {
      if (c.id === selectedCustomer.id) {
        const newTotal = c.totalCredit - amount;
        return {
          ...c,
          totalCredit: newTotal,
          status: newTotal === 0 ? 'paid' : 'due',
          lastPayment: new Date().toISOString().split('T')[0],
          transactions: [
            {
              date: new Date().toISOString().split('T')[0],
              type: 'payment',
              amount: -amount,
              description: paymentMode === 'wave-off' ? 'Waived Off / Discount' : `Paid via ${paymentMode.toUpperCase()}`
            },
            ...c.transactions
          ]
        } as Customer;
      }
      return c;
    });

    setCustomers(updatedCustomers);
    setShowSettleDialog(false);
    toast.success(paymentMode === 'wave-off' ? 'Amount waived off' : 'Payment recorded successfully');
  };

  const currentQR = upiConfigs.find(u => u.id === selectedQrId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 pt-6 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl">Credit Management</h1>
            <p className="text-purple-100 text-sm">उधार का हिसाब</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/95 backdrop-blur p-3 border-0">
            <div className="text-xs text-gray-600 mb-1">Total Due</div>
            <div className="text-xl text-red-600">₹{totalCreditDue.toLocaleString()}</div>
          </Card>
          <Card className="bg-white/95 backdrop-blur p-3 border-0">
            <div className="text-xs text-gray-600 mb-1">Active Customers</div>
            <div className="text-xl text-gray-800">{customers.filter(c => c.totalCredit > 0).length}</div>
          </Card>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Add Customer Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="+91 99999 88888"
                  className="mt-2"
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleAddCustomer}>
                Save Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* List */}
        <div className="space-y-3">
          {customers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onSendReminder={handleSendReminder}
              onAddCredit={handleOpenAddCredit}
              onSettle={handleOpenSettle}
            />
          ))}
        </div>
      </div>

      {/* Add Credit Dialog */}
      <Dialog open={showAddCreditDialog} onOpenChange={setShowAddCreditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Credit for {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                className="mt-2 text-lg font-semibold"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                className="mt-2"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
              />
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleConfirmAddCredit}>Add Udhaar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settle Dialog */}
      <Dialog open={showSettleDialog} onOpenChange={setShowSettleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-sm text-purple-600">Total Due</div>
              <div className="text-2xl font-bold text-purple-800">₹{selectedCustomer?.totalCredit}</div>
            </div>

            <div>
              <Label>Payment Amount (₹)</Label>
              <Input
                type="number"
                className="mt-2 text-lg font-semibold"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
              />
            </div>

            <div>
              <Label>Payment Mode</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={paymentMode === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMode('cash')}
                  className={paymentMode === 'cash' ? 'bg-green-600' : ''}
                >
                  <Banknote className="w-4 h-4 mr-1" /> Cash
                </Button>
                <Button
                  variant={paymentMode === 'upi' ? 'default' : 'outline'}
                  onClick={() => setPaymentMode('upi')}
                  className={paymentMode === 'upi' ? 'bg-blue-600' : ''}
                >
                  <CreditCard className="w-4 h-4 mr-1" /> UPI
                </Button>
                <Button
                  variant={paymentMode === 'wave-off' ? 'default' : 'outline'}
                  onClick={() => setPaymentMode('wave-off')}
                  className={paymentMode === 'wave-off' ? 'bg-orange-500' : ''}
                >
                  <Percent className="w-4 h-4 mr-1" /> Waiver
                </Button>
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700 mt-2" onClick={handleConfirmSettle}>
              {paymentMode === 'wave-off' ? 'Wave Off Amount' : 'Record Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog with QR Selection & Actions */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 mt-4">
              {/* QR Selection Dropdown */}
              {upiConfigs.length > 0 ? (
                <div className="space-y-2">
                  <Label>Select Payment QR</Label>
                  <Select value={selectedQrId} onValueChange={setSelectedQrId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select QR Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {upiConfigs.map(config => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.customName} ({config.appName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  No custom QRs setup. Using default.
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center group relative">
                <div className="text-sm text-gray-500 mb-2">Scan to Pay ₹{selectedCustomer.totalCredit}</div>

                {currentQR ? (
                  <img
                    src={currentQR.qrImage}
                    alt="Payment QR"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=kirana@upi&pn=KiranaStore&am=${selectedCustomer.totalCredit}&cu=INR`)}`}
                    alt="Payment QR"
                    className="w-48 h-48"
                  />
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {currentQR ? currentQR.customName : 'Default Store QR'}
                </div>

                {/* Overlay Hint */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/75 text-white text-xs px-2 py-1 rounded">Preview</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                  onClick={handleShareOnWhatsApp}
                >
                  <Send className="w-5 h-5 mr-2" /> Share on WhatsApp
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={handleCopyQR}
                  >
                    <QrCode className="w-4 h-4 mr-2" /> Copy QR
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-gray-500"
                    onClick={() => setShowQRDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav currentScreen="credit" onNavigate={onNavigate} />
    </div>
  );
}

function CustomerCard({ customer, onSendReminder, onAddCredit, onSettle }: {
  customer: Customer;
  onSendReminder: (c: Customer) => void;
  onAddCredit: (c: Customer) => void;
  onSettle: (c: Customer) => void;
}) {
  const statusConfig = {
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
    due: { color: 'bg-orange-100 text-orange-700', icon: Clock, label: 'Due' },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Overdue' }
  };
  const status = statusConfig[customer.status];
  const StatusIcon = status.icon;

  return (
    <Card className={`p-4 ${customer.status === 'overdue' ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-800 font-medium">{customer.name}</h3>
            {customer.totalCredit > 0 ? (
              <Badge className={`${status.color} hover:${status.color} text-xs`}>
                <StatusIcon className="w-3 h-3 mr-1" />{status.label}
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                <CheckCircle className="w-3 h-3" /> Paid
              </Badge>
            )}

          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Phone className="w-3 h-3" /> {customer.phone}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total Due</div>
          <div className="text-lg font-bold text-red-600">₹{customer.totalCredit}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => onAddCredit(customer)}
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>

        {customer.totalCredit > 0 && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => onSettle(customer)}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Settle
            </Button>

            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onSendReminder(customer)}
            >
              <Send className="w-3 h-3 mr-1" /> Nudge
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
