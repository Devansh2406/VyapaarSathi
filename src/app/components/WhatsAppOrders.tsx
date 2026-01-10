import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Check, X, MessageCircle, Package, QrCode, CheckCircle, Share2, ClipboardPaste, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
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

export default function WhatsAppOrders({ onNavigate }: WhatsAppOrdersProps) {
  const [orders, setOrders] = useState<Order[]>(() => {
    // Initialize from Local DB
    return getFromDB(DB_KEYS.ORDERS, []);
  });

  // Save changes to DB
  useEffect(() => {
    saveToDB(DB_KEYS.ORDERS, orders);
  }, [orders]);

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<number | null>(null);

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

  const parseAndAddOrder = () => {
    if (!importText || !importCustomerName) return;

    const lines = importText.split('\n').filter(line => line.trim());
    const newItems: OrderItem[] = lines.map(line => {
      // 1. Parse Quantity
      const qtyMatch = line.match(/^\d+/);
      const quantity = qtyMatch ? parseInt(qtyMatch[0]) : 1;

      // 2. Parse Name
      const rawName = line.replace(/^\d+/, '').replace(/[-x]/, '').trim();

      // 3. Check Inventory
      const product = findProductByName(rawName);

      if (product) {
        return {
          name: product.name, // Use canonical name
          quantity,
          price: product.sellingPrice,
          isAvailable: product.quantity >= quantity,
          stockQty: product.quantity
        };
      } else {
        return {
          name: rawName || 'Unknown Item',
          quantity,
          price: 0, // Unknown price
          isAvailable: false, // Assume not in standard inventory
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
    toast.success('Order Imported & Checked vs Inventory!');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status !== 'pending');

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
                        <Button
                          onClick={() => handleMarkAsPaid(order.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Mark as Paid
                        </Button>
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

      {/* ... QR Dialog remains same ... */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
            <DialogDescription>Customer can scan this QR code to pay via UPI</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-white/80 pointer-events-none" />
              <div className="w-48 h-48 bg-gray-900 rounded-xl flex items-center justify-center relative z-10">
                <QrCode className="w-32 h-32 text-white" />
              </div>
            </div>

            {selectedOrderForPayment && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{orders.find(o => o.id === selectedOrderForPayment)?.total}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={() => selectedOrderForPayment && handleMarkAsPaid(selectedOrderForPayment)}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Application Paid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav currentScreen="orders" onNavigate={onNavigate} />
    </div>
  );
}