import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, AlertTriangle, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import BottomNav from './BottomNav';
import { getProducts, addProduct, Product } from '../../services/inventoryService';
import { toast } from 'sonner';

interface InventoryManagementProps {
  onNavigate: (screen: string) => void;
}

export default function InventoryManagement({ onNavigate }: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    unit: 'pcs',
    quantity: 0,
    minStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    trend: 'stable'
  });

  // Load products on mount
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category) {
      toast.error('Please fill in check Name & Category');
      return;
    }

    const productToAdd: Product = {
      id: Date.now(), // Simple ID generation
      name: newProduct.name,
      category: newProduct.category,
      quantity: Number(newProduct.quantity) || 0,
      minStock: Number(newProduct.minStock) || 0,
      costPrice: Number(newProduct.costPrice) || 0,
      sellingPrice: Number(newProduct.sellingPrice) || 0,
      unit: newProduct.unit || 'pcs',
      trend: 'stable'
    };

    addProduct(productToAdd);
    setProducts(getProducts()); // Refresh list
    setShowAddDialog(false);
    setNewProduct({ // Reset form
      name: '',
      category: '',
      unit: 'pcs',
      quantity: 0,
      minStock: 0,
      costPrice: 0,
      sellingPrice: 0,
      trend: 'stable'
    });
    toast.success('Product added successfully!');
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.quantity < p.minStock);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-500 text-white px-4 pt-6 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl">Inventory</h1>
            <p className="text-blue-100 text-sm">{products.length} products in stock</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/95 backdrop-blur p-3 border-0">
            <div className="text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-xl text-gray-800">₹{totalValue.toLocaleString()}</div>
          </Card>
          <Card className="bg-white/95 backdrop-blur p-3 border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Low Stock</div>
                <div className="text-xl text-red-600">{lowStockProducts.length}</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Add Product Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  placeholder="e.g., Milk (500ml)"
                  className="mt-2"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Instant Food">Instant Food</SelectItem>
                    <SelectItem value="Cooking Oil">Cooking Oil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={newProduct.unit}
                    onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="pkt">pkt</SelectItem>
                      <SelectItem value="box">box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="mt-2"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Min Stock</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="mt-2"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cost Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="mt-2"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Selling Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="mt-2"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAddProduct}>
                  Add Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Products List */}
        <div className="space-y-3">
          {filteredProducts.map(product => {
            const isLowStock = product.quantity < product.minStock;
            const profit = product.sellingPrice - product.costPrice;
            const profitPercent = product.costPrice > 0 ? ((profit / product.costPrice) * 100).toFixed(1) : '0';

            return (
              <Card key={product.id} className={`p-4 ${isLowStock ? 'border-l-4 border-l-red-500 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-800">{product.name}</h3>
                      {product.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {product.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="text-sm text-gray-600">{product.category} • {product.unit || 'pcs'}</div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${isLowStock ? 'bg-red-100' : 'bg-green-100'}`}>
                    <div className="text-xs text-gray-600 mb-1">Stock</div>
                    <div className={`${isLowStock ? 'text-red-700' : 'text-green-700'}`}>
                      {product.quantity}
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Min</div>
                    <div className="text-gray-800">{product.minStock}</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="text-xs text-blue-600 mb-1">Cost</div>
                    <div className="text-blue-800">₹{product.costPrice}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg">
                    <div className="text-xs text-green-600 mb-1">Sale</div>
                    <div className="text-green-800">₹{product.sellingPrice}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      +{profitPercent}% profit
                    </Badge>
                    {isLowStock && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Value: ₹{(product.quantity * product.costPrice).toLocaleString()}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNav currentScreen="inventory" onNavigate={onNavigate} />
    </div>
  );
}