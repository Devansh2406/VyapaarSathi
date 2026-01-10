import { getFromDB, saveToDB, DB_KEYS, initializeDB } from './localDB';

export interface Product {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit?: string;
    minStock: number;
    costPrice: number;
    sellingPrice: number;
    trend: 'up' | 'down' | 'stable';
}

// Ensure DB is ready
initializeDB();

export const getProducts = (): Product[] => {
    return getFromDB<Product[]>(DB_KEYS.INVENTORY, []);
};

export const findProductByName = (name: string): Product | undefined => {
    const products = getProducts();
    const searchTerm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return products.find(p => {
        const productName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return productName.includes(searchTerm) || searchTerm.includes(productName);
    });
};

export const addProduct = (product: Product) => {
    const products = getProducts();
    products.push(product);
    saveToDB(DB_KEYS.INVENTORY, products);
};

export const updateProduct = (updatedProduct: Product) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
        products[index] = updatedProduct;
        saveToDB(DB_KEYS.INVENTORY, products);
    }
}
