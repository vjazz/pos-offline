import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Stack from "@mui/material/Stack";
import SearchBar from "./components/SearchBar/SearchBar";
import { Alert, Box, Divider, useMediaQuery } from "@mui/material";
import ProductList from "./components/ProductList/ProductList";
import Cart from "./components/Cart/Cart";
import Header from "./components/Header/Header";
import OfflineDataStore from "./utils/OfflineDataStore";
import PrintJobManager from "./utils/PrintJobManager";

// import OfflineDataStore from "./lib/offlineDataStore.js";

function App() {
  // const [dataStore] = useState(() => new OfflineDataStore());
  // const dataStore = new OfflineDataStore();
  const dataStore = useRef(null);
  const printManager = useRef(null);
  const [productData, setProductData] = React.useState([]);
  const [cartData, setCartData] = React.useState([]);
  const [appData, setAppData] = React.useState({});
  const [filteredProductData, setFilteredProductData] = React.useState([]);
  const [filterCategoryName, setFilterCategoryName] = React.useState("All");
  const [cartSize, setCartSize] = React.useState(0);
  const [orderPlaced, setOrderPlaced] = React.useState(false);

  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    pendingWrites: 0,
    syncInProgress: false,
  });
  const isMobile = useMediaQuery("(max-width:600px)");

  const [categories, setCategories] = React.useState([]);
  // const onSearch = useCallback(
  //   (value) => {
  //     // if (!value) {
  //     //   setFilteredProductData();
  //     //   return;
  //     // }
  //     console.log(value);
  //     // add api call to fetch data for search
  //     const products = productData.filter(({ item_name, item_category }) => {
  //       if (filterCategoryName === "All") {
  //         return item_name.toLowerCase().includes(value.toLowerCase());
  //       } else {
  //         return item_name
  //           .toLowerCase()
  //           .includes(
  //             value.toLowerCase() && item_category === filterCategoryName
  //           );
  //       }
  //     });
  //     setFilteredProductData(products);
  //   },
  //   [productData, filterCategoryName]
  // );

  // const onFilter = useCallback(
  //   (value) => {
  //     console.log("filter", value);
  //     setFilterCategoryName(value);
  //     if (value === "All") {
  //       setFilteredProductData(productData);
  //     } else {
  //       const product = productData.filter(
  //         ({ item_category }) => item_category === value
  //       );
  //       setFilteredProductData(product);
  //     }
  //   },
  //   [productData, setFilteredProductData]
  // );

  const onSearchFilter = useCallback(
    (searchValue, filterValue) => {
      console.log("searchFilter", searchValue, filterValue);
      let products = productData;
      if (filterValue && filterValue !== "All") {
        products = products.filter(
          ({ item_category }) => item_category === filterValue
        );
      }
      if (searchValue) {
        products = products.filter(({ item_name }) =>
          item_name.toLowerCase().includes(searchValue.toLowerCase())
        );
      }
      setFilteredProductData(products);
    },
    [productData]
  );

  useEffect(() => {
    // oreder of keys matter
    if (dataStore.current) {
      // dataStore.current.set("app_data", { ...appData, cart: cartData });
      dataStore.current.set("cart_data", cartData);
    }
  }, [cartData]);

  useEffect(() => {
    if (appData?.order?.id && !orderPlaced && cartData.length !== 0) {
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setCartData([]);
        dataStore.current.set("order_data", { order: {} });
      }, 2000);
    }
  }, [appData, orderPlaced, cartData.length]);

  useEffect(() => {
    // Initialize data store or any other setup logic here
    dataStore.current = new OfflineDataStore();
    printManager.current = new PrintJobManager(dataStore.current);

    const handleConnectionChange = ({ isOnline }) => {
      setSyncStatus((prev) => ({ ...prev, isOnline }));
    };

    const handleDataChanged = ({ key, value }) => {
      // if (key === "cart") setCart(value);
      // if (key === "orders") setOrders(value);
      // if (key === "printQueue") setPrintQueue(value);
      if (key === "app_data") setAppData(value);
      // if (key === "cart_data") setCartData(value);

      // Update sync status
      setSyncStatus((prev) => ({
        ...prev,
        pendingWrites: dataStore.current.getSyncStatus().pendingWrites,
      }));
    };

    const handleSyncComplete = ({ pendingCount }) => {
      setSyncStatus((prev) => ({
        ...prev,
        syncInProgress: false,
        pendingWrites: pendingCount,
      }));
    };
    const handleSyncStarted = () => {
      setSyncStatus((prev) => ({ ...prev, syncInProgress: true }));
    };

    dataStore.current.on("connectionChange", handleConnectionChange);
    dataStore.current.on("dataChanged", handleDataChanged);
    dataStore.current.on("syncStarted", handleSyncStarted);
    dataStore.current.on("syncComplete", handleSyncComplete);

    const loadInitialData = async () => {
      const data = await dataStore.current.get("app_data");
      const cart_data = await dataStore.current.get("cart_data");
      setAppData(data);
      setProductData(data.product_list);
      setCategories(data.categories);
      setFilteredProductData(data.product_list);
      setCartData(data?.cart || cart_data || []);

      setSyncStatus(dataStore.current.getSyncStatus());
    };

    loadInitialData();

    return () => {
      if (dataStore.current) {
        dataStore.current.off("connectionChange", handleConnectionChange);
        dataStore.current.off("dataChanged", handleDataChanged);
        dataStore.current.off("syncStarted", handleSyncStarted);
        dataStore.current.off("syncComplete", handleSyncComplete);
      }
    };
  }, [dataStore]);

  useEffect(() => {
    setCartSize(cartData?.reduce((acc, item) => acc + item.quantity, 0));
  }, [cartData]);

  const placeOrder = useCallback(async () => {
    if (dataStore.current) {
      // dataStore.current.set("app_data", { ...appData, cart: cartData });

      const order = {
        id: Date.now(),
        items: cartData,
        total: cartData.reduce((acc, i) => acc + i.price * i.quantity, 0),
        timestamp: Date.now(),
      };

      await dataStore.current.set("order_data", { order });

      await printManager.current.queuePrintJob(order.id, "receipt");
      await printManager.current.queuePrintJob(order.id, "kitchen");
      await printManager.current.queuePrintJob(order.id, "bar");

      console.log("✅ Order placed and print jobs queued");
    }
  }, [cartData]);

  return (
    <Box sx={{ flexGrow: 1, marginTop: "20px" }}>
      {orderPlaced && (
        <Stack
          sx={{
            // width: "50%",
            position: "absolute",
            zIndex: 99,
            // right: 0,
            top: 30,
            // left: "30%",
            right: 20,
          }}
          spacing={2}
        >
          <Alert variant="filled" severity="success">
            Order placed successfully! Check console for print job status.
          </Alert>
        </Stack>
      )}
      <Header totalCart={cartSize} syncStatus={syncStatus}></Header>
      <Stack direction="row" spacing={2} pt={2} px={2} height="85vh">
        <Stack width={isMobile ? "100%" : "70%"} spacing={2}>
          <SearchBar
            categories={categories}
            // onSearch={onSearch}
            // onFilter={onFilter}
            filterCategoryName={filterCategoryName}
            onSearchFilter={onSearchFilter}
          />
          <ProductList
            productData={filteredProductData}
            setCartData={setCartData}
          />
        </Stack>
        {!isMobile && <Divider orientation="vertical" flexItem />}
        <Cart
          cartItems={cartData}
          setCartItems={setCartData}
          placeOrder={placeOrder}
        />
      </Stack>
    </Box>
  );
}

export default App;
