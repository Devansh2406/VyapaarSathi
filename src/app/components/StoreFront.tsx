import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Send, ArrowLeft, Search, Package, Trash2, MapPin, Phone, User, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { getProducts, Product } from '../../services/inventoryService';
import { toast } from 'sonner';

interface StoreFrontProps {
    onNavigate: (screen: string) => void;
}

interface CartItem extends Product {
    cartQty: number;
}

type ViewState = 'store' | 'cart' | 'success';

export default function StoreFront({ onNavigate }: StoreFrontProps) {
    const [products] = useState<Product[]>(getProducts());
    const [cart, setCart] = useState<CartItem[]>([]);

    // Checkout Form State
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [mobile, setMobile] = useState('');

    // View State
    const [view, setView] = useState<ViewState>('store');
    const [searchQuery, setSearchQuery] = useState('');

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, cartQty: p.cartQty + 1 } : p);
            }
            return [...prev, { ...product, cartQty: 1 }];
        });
        toast.success('Added to bag');
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === productId);
            if (existing && existing.cartQty > 1) {
                return prev.map(p => p.id === productId ? { ...p, cartQty: p.cartQty - 1 } : p);
            }
            return prev.filter(p => p.id !== productId);
        });
    };

    const deleteFromCart = (productId: number) => {
        setCart(prev => prev.filter(p => p.id !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.cartQty), 0);

    const handlePlaceOrder = () => {
        if (!customerName.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (!mobile.trim()) {
            toast.error('Please enter your mobile number');
            return;
        }
        if (!address.trim()) {
            toast.error('Please enter your address');
            return;
        }

        // Format message for WhatsApp
        const itemsList = cart.map(item => `• ${item.name} x ${item.cartQty} - ₹${item.sellingPrice * item.cartQty}`).join('\n');

        const messageBody =
            `*New Order via Vyaapar Sathi*
------------------------
*Customer Details:*
👤 Name: ${customerName}
📱 Mobile: ${mobile}
📍 Address: ${address}

*Order Details:*
${itemsList}

*Total Amount: ₹${totalAmount}*
------------------------
Please accept my order. I understand that payment details (UPI) will be shared after acceptance.`;

        const message = encodeURIComponent(messageBody);

        // Open WhatsApp
        window.open(`https://wa.me/919871159740?text=${message}`, '_blank');

        // Clear cart and show success
        setCart([]);
        setView('success');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Render Success View
    if (view === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Sent Successfully!</h2>
                <p className="text-gray-500 mb-8 max-w-xs">
                    Your order has been sent to the store owner on WhatsApp. They will review it and share payment details shortly.
                </p>
                <Button
                    onClick={() => {
                        setView('store');
                        setCustomerName('');
                        setAddress('');
                        setMobile('');
                    }}
                    className="bg-gray-900 text-white min-w-[200px]"
                >
                    Back to Shop
                </Button>
            </div>
        );
    }

    // Render Cart View
    if (view === 'cart') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Cart Header */}
                <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setView('store')}>
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900">Your Cart ({cart.length})</h1>
                </div>

                <div className="flex-1 p-4 pb-32 overflow-y-auto">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-20">
                            <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                            <p>Your cart is empty</p>
                            <Button variant="link" onClick={() => setView('store')}>Start Shopping</Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Cart Items */}
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-3">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                                                    <p className="text-xs text-gray-500">{item.category}</p>
                                                </div>
                                                <button onClick={() => deleteFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="font-bold text-gray-900">₹{item.sellingPrice * item.cartQty}</p>
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 text-xs">-</button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.cartQty}</span>
                                                    <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 text-xs">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Customer Details Form */}
                            <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Delivery Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Full Name"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Mobile Number"
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Textarea
                                            placeholder="Delivery Address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="pl-9 resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bill Details */}
                            <div className="bg-white p-4 rounded-xl shadow-sm space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Item Total</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Delivery Charges</span>
                                    <span>To be calculated</span>
                                </div>
                                <div className="border-t border-dashed pt-2 flex justify-between font-bold text-gray-900 text-base">
                                    <span>Total Amount</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                            </div>

                            {/* Payment Notice */}
                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start text-xs text-blue-700">
                                <div className="mt-0.5">ℹ️</div>
                                <p>
                                    Payment with UPI will be requested on WhatsApp once the Store owner accepts your order.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {cart.length > 0 && (
                    <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
                        <Button
                            onClick={handlePlaceOrder}
                            className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                        >
                            <span>Place Order via WhatsApp</span>
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // Default: Store View
    return (
        <div className="min-h-screen bg-gray-50 pb-24 relative">
            {/* Customer Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onNavigate('orders')}>
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">My Online Shop</h1>
                            <p className="text-xs text-gray-500">Order directly on WhatsApp</p>
                        </div>
                    </div>
                    <div className="relative cursor-pointer" onClick={() => setView('cart')}>
                        <ShoppingBag className="w-6 h-6 text-gray-700" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search items..."
                        className="pl-9 bg-gray-100 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="p-4 grid grid-cols-2 gap-4">
                {filteredProducts.map(product => {
                    const inCart = cart.find(c => c.id === product.id);
                    return (
                        <Card key={product.id} className="p-3 flex flex-col justify-between">
                            <div>
                                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-gray-900">₹{product.sellingPrice}</p>
                                    {product.quantity < 5 && (
                                        <Badge variant="outline" className="text-[10px] px-1 h-5 text-red-500 border-red-200">
                                            Only {product.quantity} left
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {inCart ? (
                                <div className="flex items-center justify-between bg-green-50 rounded-lg p-1">
                                    <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-green-600 font-bold">-</button>
                                    <span className="font-medium text-green-700 text-sm">{inCart.cartQty}</span>
                                    <button onClick={() => addToCart(product)} className="w-8 h-8 flex items-center justify-center bg-green-600 rounded shadow-sm text-white font-bold">+</button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => addToCart(product)}
                                    className="w-full h-9 bg-gray-900 hover:bg-gray-800 text-white text-xs"
                                >
                                    Add to Bag
                                </Button>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Floating Cart Teaser (only in store view) */}
            {cart.length > 0 && view === 'store' && (
                <div className="fixed bottom-4 left-4 right-4 z-20">
                    <Button
                        onClick={() => setView('cart')}
                        className="w-full h-14 bg-gray-900 text-white shadow-xl rounded-xl flex items-center justify-between px-6 animate-in slide-in-from-bottom-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold border border-gray-700">
                                {cart.length}
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <span className="text-sm font-medium text-gray-300">Total</span>
                                <span className="font-bold text-lg">₹{totalAmount}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 font-bold">
                            View Cart <ShoppingBag className="w-5 h-5" />
                        </div>
                    </Button>
                </div>
            )}
        </div>
    );
}
