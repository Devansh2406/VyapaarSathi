import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Send, ArrowLeft, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { getProducts, Product } from '../../services/inventoryService';
import { toast } from 'sonner';

interface StoreFrontProps {
    onNavigate: (screen: string) => void;
}

interface CartItem extends Product {
    cartQty: number;
}

export default function StoreFront({ onNavigate }: StoreFrontProps) {
    const [products] = useState<Product[]>(getProducts());
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
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

    const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.cartQty), 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Your bag is empty');
            return;
        }
        if (!customerName.trim()) {
            toast.error('Please enter your name');
            return;
        }

        // Format message for WhatsApp
        // Format: "Name\nQty Item\nQty Item"
        const itemsList = cart.map(item => `${item.cartQty} ${item.name}`).join('\n');
        const message = encodeURIComponent(
            `New Order from *${customerName}*\n\n${itemsList}\n\n*Total Estimate: ₹${totalAmount}*`
        );

        // Open WhatsApp with the shop owner's number (User's number)
        // Using a placeholder number or the one from login if we had it. Using the test number for now.
        window.open(`https://wa.me/919871159740?text=${message}`, '_blank');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div className="relative">
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

            {/* Floating Cart Footer */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20">
                    <div className="flex flex-col gap-3">
                        <Input
                            placeholder="Enter your name (e.g. Rahul)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="bg-gray-50"
                        />
                        <Button
                            onClick={handleCheckout}
                            className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg rounded-xl shadow-lg shadow-green-200 flex items-center justify-between px-6"
                        >
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5" />
                                <span>Send Order</span>
                            </div>
                            <span>₹{totalAmount}</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
