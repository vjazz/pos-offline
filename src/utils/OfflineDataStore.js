// // Offline-First Data Store
const productListData = [
  {
    id: 1,
    price: 10,
    item_name: "Burger",
    type: "Main Course",
    description: "A delicious burger with lettuce, tomato, and cheese.",
    image: "https://example.com/images/burger.jpg",
    item_category: "Fast Food",
  },
  {
    id: 2,
    price: 3,
    item_name: "Coke",
    type: "Main Course",
    description: "A delicious cold Beverages",
    image: "🧁",
    item_category: "Beverages",
  },
  {
    id: 3,
    price: 4,
    item_name: "Coffee",
    type: "Main Course",
    description: "A delicious hot Beverages.",
    image: "https://example.com/images/burger.jpg",
    item_category: "Beverages",
  },
  {
    id: 4,
    price: 12,
    item_name: "Rolls",
    type: "Main Course",
    description: "A delicious roll with panner and vegies.",
    image: "https://example.com/images/burger.jpg",
    item_category: "Fast Food",
  },
  {
    id: 5,
    price: 15,
    item_name: "Cake",
    type: "Main Course",
    description: "A delicious Desserts with chocolate and vanilla.",
    image: "https://example.com/images/burger.jpg",
    item_category: "Desserts",
  },
  {
    id: 6,
    price: 6,
    item_name: "Brownie",
    type: "Main Course",
    description: "A delicious Desserts with chocolate and nuts.",
    image: "https://example.com/images/burger.jpg",
    item_category: "Desserts",
  },
];

class OfflineDataStore {
  constructor() {
    this.data = new Map(); // In-memory cache
    this.pendingWrites = new Map(); // Queue for offline writes
    this.isOnline = navigator.onLine;
    this.listeners = new Map(); // Event listeners
    this.syncInProgress = false;

    // Setup online/offline detection
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    this.loadFromLocalStorage();
  }

  // Initialize with mock data instead of localStorage
  initializeMockData() {
    const initialData = {
      product_list: productListData,
      categories: ["Fast Food", "Desserts", "Beverages"],
      tables: ["Table 1", "Table 2", "Table 3"],
      cart: [],
      order: [],
      printQueue: [],
    };

    Object.entries(initialData).forEach(([key, value]) => {
      this.data.set(key, value);
    });
  }

  //   // Load existing data from localStorage
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem("pos_data");
      if (stored) {
        const parsedData = JSON.parse(stored);
        Object.entries(parsedData).forEach(([key, value]) => {
          this.data.set(key, value);
        });
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }

  // Save to localStorage
  saveToLocalStorage() {
    try {
      const dataObj = Object.fromEntries(this.data);
      const pendingObj = Object.fromEntries(this.pendingWrites);

      localStorage.setItem("pos_data", JSON.stringify(dataObj));
      localStorage.setItem("pos_pending_writes", JSON.stringify(pendingObj));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // Read data with caching
  async get(key) {
    // Return from cache if available
    if (this.data.has(key)) {
      return this.data.get(key);
    }

    // If online, try to fetch from server
    if (this.isOnline) {
      try {
        // mock this with a fetch call
        // const response = await fetch(`/api/data/${key}`);
        // if (response.ok || true) {
        if (true) {
          //   const data = await response.json();
          if (key === "app_data") {
            const data = {
              product_list: productListData,
              categories: ["Fast Food", "Desserts", "Beverages"],
              table: ["Table 1", "Table 2", "Table 3"],
              // cart updated value should come from api if any
              cart: [],
              // order updated value should come from api if any
              order: [],
              printQueue: [],
            }; // Mock data
            this.data.set(key, data);
            this.saveToLocalStorage();
            return data;
          }
        }
      } catch (error) {
        console.log("Failed to fetch ", error);
      }
    }

    return null;
  }

  // Write data (queued when offline)
  async set(key, value) {
    // Always update local cache immediately (optimistic update)
    this.data.set(key, value);
    this.saveToLocalStorage();

    // Notify listeners of the change
    this.notifyListeners("dataChanged", { key, value });

    if (this.isOnline) {
      try {
        await this.syncToServer(key, value);
        // Remove from pending if sync successful
        this.pendingWrites.delete(key);
      } catch (error) {
        // Add to pending writes if sync fails
        this.pendingWrites.set(key, {
          value,
          timestamp: Date.now(),
          retries: 0,
        });
      }
    } else {
      // Offline: add to pending writes
      this.pendingWrites.set(key, {
        value,
        timestamp: Date.now(),
        retries: 0,
      });
    }

    this.saveToLocalStorage();
  }

  // // Read data with caching
  // async get(key) {
  //   // Return from cache if available
  //   if (this.data.has(key)) {
  //     return this.data.get(key);
  //   }

  //   // If online, try to fetch from server
  //   if (this.isOnline) {
  //     try {
  //       // Mock server response
  //       if (key === "app_data") {
  //         const data = {
  //           product_list: productListData,
  //           categories: ["Fast Food", "Desserts", "Beverages"],
  //           tables: ["Table 1", "Table 2", "Table 3"],
  //           cart: [],
  //           orders: [],
  //           printQueue: [],
  //         };
  //         this.data.set(key, data);
  //         return data;
  //       }
  //     } catch (error) {
  //       console.log("Failed to fetch ", error);
  //     }
  //   }

  //   return null;
  // }

  // // Write data (queued when offline)
  // async set(key, value) {
  //   // Always update local cache immediately (optimistic update)
  //   this.data.set(key, value);

  //   // Notify listeners of the change
  //   this.notifyListeners("dataChanged", { key, value });

  //   if (this.isOnline) {
  //     try {
  //       await this.syncToServer(key, value);
  //       // Remove from pending if sync successful
  //       this.pendingWrites.delete(key);
  //     } catch (error) {
  //       // Add to pending writes if sync fails
  //       this.pendingWrites.set(key, {
  //         value,
  //         timestamp: Date.now(),
  //         retries: 0,
  //       });
  //     }
  //   } else {
  //     // Offline: add to pending writes
  //     this.pendingWrites.set(key, {
  //       value,
  //       timestamp: Date.now(),
  //       retries: 0,
  //     });
  //   }
  // }

  // Delete data
  async delete(key) {
    this.data.delete(key);
    this.notifyListeners("dataDeleted", { key });

    if (this.isOnline) {
      try {
        // Mock API call
        console.log(`DELETE /api/data/${key}`);
      } catch (error) {
        this.pendingWrites.set(key, {
          value: null,
          operation: "delete",
          timestamp: Date.now(),
          retries: 0,
        });
      }
    } else {
      this.pendingWrites.set(key, {
        value: null,
        operation: "delete",
        timestamp: Date.now(),
        retries: 0,
      });
    }
  }

  // Sync single item to server
  async syncToServer(key, value) {
    // Mock API call
    if (key === "cart_data") {
      // update cart data in api callthat will update app data in api
      console.log(`PUT /api/data/${key}`, value);

      // this should return the new data on initial load
      const updatedAppData = { ...this.data.get("app_data"), cart: value };
      this.data.set("app_data", updatedAppData);
      this.notifyListeners("dataChanged", {
        key: "app_data",
        value: updatedAppData,
      });
    }

    if (key === "order_data") {
      // update cart data in api callthat will update app data in api
      console.log(`PUT /api/data/${key}`, value);
      const existingdata = this.data.get("app_data");
      console.log("existingdata", existingdata);
      const updatedAppData = {
        ...this.data.get("app_data"),
        ...value,
        cart: [],
      };
      this.data.set("app_data", updatedAppData);
      this.data.set("cart_data", []);
      this.notifyListeners("dataChanged", {
        key: "app_data",
        value: updatedAppData,
      });
      this.notifyListeners("dataChanged", {
        key: "cart_data",
        value: [],
      });
    }

    // Simulate network delay
    // await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate occasional failures when offline
    if (!this.isOnline && Math.random() < 0.3) {
      throw new Error("Network unavailable");
    }
  }

  // Handle coming online
  async handleOnline() {
    this.isOnline = true;
    this.notifyListeners("connectionChange", { isOnline: true });

    if (this.pendingWrites.size > 0) {
      await this.syncPendingWrites();
    }
  }

  // Handle going offline
  handleOffline() {
    this.isOnline = false;
    this.notifyListeners("connectionChange", { isOnline: false });
  }

  // Sync all pending writes when back online
  async syncPendingWrites() {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    this.notifyListeners("syncStarted", {});

    const maxRetries = 3;
    const failedSyncs = [];

    for (const [key, pending] of this.pendingWrites.entries()) {
      try {
        if (key === "cart_data") {
          await this.syncToServer(key, pending.value);
        }
        if (key === "order_data") {
          await this.syncToServer(key, pending.value);
        }
        // if (pending.operation === "delete") {
        //   console.log(`DELETE /api/data/${key}`);
        // } else {
        //   await this.syncToServer(key, pending.value);
        // }

        // Success: remove from pending
        this.pendingWrites.delete(key);
      } catch (error) {
        pending.retries = (pending.retries || 0) + 1;

        if (pending.retries >= maxRetries) {
          failedSyncs.push(key);
          this.pendingWrites.delete(key);
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, pending.retries) * 100)
        );
      }
    }

    this.syncInProgress = false;

    if (failedSyncs.length > 0) {
      this.notifyListeners("syncFailed", { failedKeys: failedSyncs });
    }

    this.notifyListeners("syncComplete", {
      pendingCount: this.pendingWrites.size,
    });
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data));
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingWrites: this.pendingWrites.size,
      syncInProgress: this.syncInProgress,
    };
  }
}

export default OfflineDataStore;
