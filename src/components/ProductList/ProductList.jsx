import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { IconButton, Stack } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";
import ProductCustomiseModal from "../Modal/ProductCustomise.modal";

export default function ProductList({ productData, setCartData }) {
  const [openModal, setOpenModal] = React.useState(false);
  const refList = React.useRef([]);
  const [customiseProduct, setCustomiseProduct] = React.useState(null);

  const loadMoreItems = () => {
    console.log("Load more items");
    // api call to fetch more items
    // append items to the list
  };

  const handleAddToCart = (product) => {
    // console.log(e);
    setCustomiseProduct(product);
    setOpenModal(true);
    // const currentIndex = checked.indexOf(value);
    // const newChecked = [...checked];

    // if (currentIndex === -1) {
    //   newChecked.push(value);
    // } else {
    //   newChecked.splice(currentIndex, 1);
    // }

    // setChecked(newChecked);
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.unobserve(entries[0].target);
        loadMoreItems();
      }
    });

    const lastItem = refList.current[refList.current.length - 1];
    // observer.observe(lastItem);

    return () => {
      if (lastItem) {
        // observer.unobserve(lastItem);
      }
    };
  }, []);

  return (
    <>
      <List dense sx={{ width: "100%", bgcolor: "background.paper" }}>
        {productData?.map((product, index) => {
          const { id, price, item_name, image } = product;
          const labelId = `checkbox-list-secondary-label-${id}`;
          return (
            <ListItem
              ref={(el) => (refList.current[index] = el)}
              key={id}
              sx={{
                justifyContent: "space-between",
                borderBottom: "1px solid #f0f0f0",
                m: 1,
                p: 1,
              }}
              secondaryAction={
                <Stack sx={{ gap: 1 }} direction={"row"} alignItems="center">
                  Price: ${price}
                  <IconButton
                    color="primary"
                    aria-label="add to shopping cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    <AddShoppingCartIcon />
                  </IconButton>
                </Stack>
              }
              disablePadding
            >
              <ListItemAvatar>
                <Avatar
                  alt={`Avatar n${id}`}
                  src={`/static/images/avatar/${image}.jpg`}
                />
              </ListItemAvatar>
              <ListItemText id={labelId} primary={`${item_name}`} />
            </ListItem>
          );
        })}
      </List>
      <ProductCustomiseModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        customiseProduct={customiseProduct}
        setCartData={setCartData}
      />
    </>
  );
}
