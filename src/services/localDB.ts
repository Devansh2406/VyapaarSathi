
// localDB.ts
// A simple wrapper around LocalStorage to act as a database for the app.
// This ensures data persists even if you close the browser.

export const DB_KEYS = {
    INVENTORY: 'vypaar_inventory',
    ORDERS: 'vypaar_orders',
    EXPENSES: 'vypaar_expenses',
    CREDITS: 'vypaar_credits',
    SETTINGS: 'vypaar_settings'
};

export const DEFAULT_SETTINGS = {
    shopName: 'My Kirana Shop',
    ownerName: 'Devansh Rai',
    mobile: '+91 98765 43210',
    address: 'Shop 12, Main Market',
    businessHours: '09:00 AM - 10:00 PM',
    whatsappConnected: true,
    autoReply: true,
    orderConfirmation: true,
    lowStockWarning: true,
    allowPartialOrder: true,
    autoReorder: true,
    showRealProfit: false,
    includeCredit: true,
    blockRisky: false,
    enableQRPayments: true,
    voiceInput: false,
    darkMode: false,
    language: 'English'
};

// Generic Getter
export const getFromDB = <T>(key: string, defaultValue: T): T => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from DB`, error);
        return defaultValue;
    }
};

// Generic Setter
export const saveToDB = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to DB`, error);
    }
};

// --- Specialized Helpers ---

// Initialize DB with some dummy data if empty (for demo purposes)
export const initializeDB = () => {
    // Initialize Settings if missing
    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
        saveToDB(DB_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    if (!localStorage.getItem(DB_KEYS.INVENTORY)) {
        const initialInventory = [
            { id: 1, name: 'Milk (500ml)', category: 'Dairy', quantity: 8, minStock: 20, costPrice: 22, sellingPrice: 25, trend: 'up' },
            { id: 2, name: 'Bread', category: 'Bakery', quantity: 5, minStock: 15, costPrice: 25, sellingPrice: 30, trend: 'up' },
            { id: 3, name: 'Maggi Noodles', category: 'Instant Food', quantity: 12, minStock: 30, costPrice: 10, sellingPrice: 12, trend: 'up' },
            { id: 4, name: 'Tata Salt (1kg)', category: 'Groceries', quantity: 45, minStock: 20, costPrice: 18, sellingPrice: 22, trend: 'stable' },
            { id: 5, name: 'Fortune Oil (1L)', category: 'Cooking Oil', quantity: 18, minStock: 15, costPrice: 145, sellingPrice: 165, trend: 'stable' },
            { id: 6, name: 'Parle-G Biscuits', category: 'Snacks', quantity: 60, minStock: 40, costPrice: 4, sellingPrice: 5, trend: 'up' },
        ];
        saveToDB(DB_KEYS.INVENTORY, initialInventory);
    }

    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
        const initialOrders = [
            {
                id: 1,
                customerName: 'Ravi Kumar',
                phone: '+91 98765 43210',
                address: 'Shop No. 12, MG Road, Near Temple',
                items: [
                    { name: 'Milk (500ml)', quantity: 3, price: 25, isAvailable: true, stockQty: 8 },
                    { name: 'Bread', quantity: 2, price: 30, isAvailable: true, stockQty: 5 },
                ],
                total: 135,
                status: 'pending',
                paymentStatus: 'paid',
                timestamp: '10 mins ago'
            }
        ];
        saveToDB(DB_KEYS.ORDERS, initialOrders);
    }
};
