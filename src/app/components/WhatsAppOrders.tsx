import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Check, X, MessageCircle, Package, QrCode, CheckCircle, Share2, ClipboardPaste, AlertCircle, Send } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { toast } from 'sonner';
import BottomNav from './BottomNav';
import { findProductByName } from '../../services/inventoryService';
import { getFromDB, saveToDB, DB_KEYS } from '../../services/localDB';

interface WhatsAppOrdersProps {
  onNavigate: (screen: string) => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  isAvailable?: boolean;
  stockQty?: number;
}

interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'rejected';
  paymentStatus: 'pending' | 'paid';
  timestamp: string;
}

interface UPIConfig {
  id: string;
  appName: string;
  customName: string;
  qrImage: string;
}

export default function WhatsAppOrders({ onNavigate }: WhatsAppOrdersProps) {
  const [orders, setOrders] = useState<Order[]>(() => {
    return getFromDB(DB_KEYS.ORDERS, []);
  });

  // Save changes to DB
  useEffect(() => {
    saveToDB(DB_KEYS.ORDERS, orders);
  }, [orders]);

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<number | null>(null);

  // QR Logic
  const [upiConfigs, setUpiConfigs] = useState<UPIConfig[]>([]);
  const [selectedQrId, setSelectedQrId] = useState<string>('');

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

  const [importText, setImportText] = useState('');
  const [importCustomerName, setImportCustomerName] = useState('');
  const [importPhone, setImportPhone] = useState('');

  const handleAcceptOrder = (orderId: number) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: 'accepted' } : order
    ));
    toast.success('Order Accepted!');
  };

  const handleRejectOrder = (orderId: number) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: 'rejected' } : order
    ));
    toast.error('Order Rejected');
  };

  const handleShowQR = (orderId: number) => {
    setSelectedOrderForPayment(orderId);
    setShowQRDialog(true);
  };

  const handleMarkAsPaid = (orderId: number) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, paymentStatus: 'paid' } : order
    ));
    setShowQRDialog(false);
    setSelectedOrderForPayment(null);
    toast.success('Marked as Paid!');
  };

  const handleShareStore = () => {
    const text = encodeURIComponent("👋 Hello! sending you my online store link. Check out our latest inventory and order directly: https://vypaarsaathi.app/store/my-shop");
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
      toast.success("QR Code copied! You can paste it.");
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Failed to copy image.");
    }
  };

  const handleSharePaymentRequest = async () => {
    if (!selectedOrderForPayment) return;
    const order = orders.find(o => o.id === selectedOrderForPayment);
    if (!order) return;

    const selectedConfig = upiConfigs.find(u => u.id === selectedQrId);
    const accountName = selectedConfig ? selectedConfig.customName : 'Kirana Store';

    const message = `Hello ${order.customerName}, your order is accepted!\n\nPlease pay ₹${order.total} to ${accountName}.\n(Scan attached QR or copy it)\n\nTotal Due: ₹${order.total}`;

    // 1. Try Mobile Native Share (Image + Text)
    if (selectedConfig && selectedConfig.qrImage && navigator.share && navigator.canShare) {
      try {
        const file = dataURLtoFile(selectedConfig.qrImage, 'payment-qr.png');
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Payment Request',
            text: message
          });
          toast.success(`Shared via WhatsApp`);
          return;
        }
      } catch (error) {
        console.warn('Share API failed, trying URL scheme', error);
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

    // Fallback URL Scheme
    const url = `https://wa.me/${order.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    if (clipboardSuccess) {
      toast.info('QR Image copied! PASTE (Ctrl+V) in chat.', { duration: 5000 });
    }
  };

  const parseAndAddOrder = () => {
    if (!importText || !importCustomerName) return;

    const lines = importText.split('\n').filter(line => line.trim());
    const newItems: OrderItem[] = lines.map(line => {
      const qtyMatch = line.match(/^\d+/);
      const quantity = qtyMatch ? parseInt(qtyMatch[0]) : 1;
      const rawName = line.replace(/^\d+/, '').replace(/[-x]/, '').trim();
      const product = findProductByName(rawName);

      if (product) {
        return {
          name: product.name,
          quantity,
          price: product.sellingPrice,
          isAvailable: product.quantity >= quantity,
          stockQty: product.quantity
        };
      } else {
        return {
          name: rawName || 'Unknown Item',
          quantity,
          price: 0,
          isAvailable: false,
          stockQty: 0
        };
      }
    });

    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder: Order = {
      id: Date.now(),
      customerName: importCustomerName,
      phone: importPhone || 'Unknown Number',
      address: 'From WhatsApp Paste',
      items: newItems,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      timestamp: 'Just now'
    };

    setOrders([newOrder, ...orders]);
    setShowImportDialog(false);
    setImportText('');
    setImportCustomerName('');
    setImportPhone('');
    toast.success('Order Imported!');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status !== 'pending');
  const currentQR = upiConfigs.find(u => u.id === selectedQrId);
  const currentOrderTotal = selectedOrderForPayment ? orders.find(o => o.id === selectedOrderForPayment)?.total : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 pt-6 pb-6 rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">WhatsApp Orders</h1>
              <p className="text-green-100 text-sm">Manage & Connect</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('store')}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
              title="Preview Online Store"
            >
              <Package className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
              title="Import Order"
            >
              <ClipboardPaste className="w-6 h-6" />
            </button>
            <button
              onClick={handleShareStore}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
              title="Share Store Link"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/95 backdrop-blur p-3 border-0 shadow-sm">
            <div className="text-xs text-gray-600 mb-1 font-medium">Pending</div>
            <div className="text-2xl font-bold text-orange-600">{pendingOrders.length}</div>
          </Card>
          <Card className="bg-white/95 backdrop-blur p-3 border-0 shadow-sm">
            <div className="text-xs text-gray-600 mb-1 font-medium">Today</div>
            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
          </Card>
          <Card className="bg-white/95 backdrop-blur p-3 border-0 shadow-sm">
            <div className="text-xs text-gray-600 mb-1 font-medium">Value</div>
            <div className="text-xl font-bold text-green-600">₹{orders.reduce((sum, o) => sum + o.total, 0)}</div>
          </Card>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-green-200 shadow-md">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-gray-800 font-medium">Connect with Customers</h4>
              <p className="text-xs text-gray-500">Share your link to get orders directly</p>
            </div>
          </div>
          <Button
            onClick={handleShareStore}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-8 text-xs"
          >
            Share
          </Button>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div>
            <h3 className="text-gray-700 font-semibold mb-3 px-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Pending Orders
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{pendingOrders.length}</span>
            </h3>
            <div className="space-y-3">
              {pendingOrders.map(order => (
                <Card key={order.id} className="p-4 border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                  {/* Customer Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-gray-800 font-semibold text-lg">{order.customerName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="w-3.5 h-3.5" />
                        {order.phone}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 mt-0.5" />
                        <span className="flex-1 line-clamp-1">{order.address}</span>
                      </div>
                    </div>
                    <Badge className="bg-orange-50 text-orange-600 border-orange-100">
                      {order.timestamp}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50/80 rounded-xl p-3 mb-4 border border-gray-100">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Items Requested</span>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Stock Status</span>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold w-8 text-center">
                              {item.quantity}x
                            </span>
                            <span className="text-gray-800 font-medium">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Stock Indicator */}
                            {item.isAvailable ? (
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs h-5 px-1.5 gap-1">
                                <CheckCircle className="w-3 h-3" />
                                In Stock ({item.stockQty})
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs h-5 px-1.5 gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {item.stockQty !== undefined ? `Low Stock (${item.stockQty})` : 'Not Found'}
                              </Badge>
                            )}
                            <span className="text-gray-600 font-mono w-16 text-right">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-2 flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Total Estimate</span>
                      <span className="text-lg font-bold text-gray-800">₹{order.total}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleRejectOrder(order.id)}
                      variant="outline"
                      className="flex-1 h-10 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleShowQR(order.id)}
                      variant="secondary"
                      className="h-10 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <QrCode className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-[2] h-10 bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg"
                    >
                      Accept
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div className="pt-4">
            <h3 className="text-gray-700 font-semibold mb-3 px-1">Recent History</h3>
            <div className="space-y-3">
              {completedOrders.map(order => (
                <Card key={order.id} className="p-4 bg-white/60 border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-gray-800 font-medium">{order.customerName}</h3>
                      <div className="text-xs text-gray-500">{order.items.length} items • ₹{order.total}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={
                        order.status === 'accepted'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0'
                          : 'bg-red-100 text-red-700 hover:bg-red-100 border-0'
                      }>
                        {order.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </Badge>
                    </div>
                  </div>

                  {/* Payment Action for Accepted Orders */}
                  {order.status === 'accepted' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Payment Status</span>
                      {order.paymentStatus === 'paid' ? (
                        <div className="flex items-center text-green-600 gap-1 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Paid
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleShowQR(order.id)}
                            size="sm"
                            variant="secondary"
                            className="h-8 bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            Share QR
                          </Button>
                          <Button
                            onClick={() => handleMarkAsPaid(order.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            Mark Paid
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Import Order Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Order from WhatsApp</DialogTitle>
            <DialogDescription>Paste the order text directly from WhatsApp to create an order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Customer Name (e.g. Rahul)"
              value={importCustomerName}
              onChange={(e) => setImportCustomerName(e.target.value)}
            />
            <Input
              placeholder="Phone (Optional)"
              value={importPhone}
              onChange={(e) => setImportPhone(e.target.value)}
            />
            <Textarea
              placeholder="Paste items here...&#10;Example:&#10;2 Milk&#10;1 Bread&#10;5kg Atta"
              className="h-32"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button onClick={parseAndAddOrder} className="bg-green-600 hover:bg-green-700">Check Inventory & Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced QR Payment Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payment</DialogTitle>
            <DialogDescription>Share QR code with customer</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            {/* QR Selection */}
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
              <p className="text-sm text-gray-500 mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900 mb-4">₹{currentOrderTotal}</p>

              {currentQR ? (
                <img
                  src={currentQR.qrImage}
                  alt="Payment QR"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=kirana@upi&pn=KiranaStore&am=${currentOrderTotal}&cu=INR`)}`}
                  alt="Payment QR"
                  className="w-48 h-48"
                />
              )}
              <div className="text-xs text-gray-400 mt-2">
                {currentQR ? currentQR.customName : 'Store UPI'}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white h-11 text-lg"
                onClick={handleSharePaymentRequest}
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

              {selectedOrderForPayment && orders.find(o => o.id === selectedOrderForPayment)?.paymentStatus !== 'paid' && (
                <Button
                  variant="link"
                  onClick={() => selectedOrderForPayment && handleMarkAsPaid(selectedOrderForPayment)}
                  className="w-full text-green-600 text-sm"
                >
                  Mark as Paid Locally
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav currentScreen="orders" onNavigate={onNavigate} />
    </div>
  );
}