import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useState } from "react";

const Cart = ({ cartItems = [], setCartItems, placeOrder }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const updateQuantity = useCallback(
    (type, index) => {
      const newCartItems = [...cartItems];
      if (type === "add") {
        newCartItems[index].quantity += 1;
      } else if (type === "remove" && newCartItems[index].quantity >= 1) {
        newCartItems[index].quantity -= 1;
        if (newCartItems[index].quantity === 0) {
          newCartItems.splice(index, 1);
        }
      }
      setCartItems(newCartItems);
    },
    [cartItems, setCartItems]
  );

  const renderCart = useCallback(() => {
    return (
      <>
        {!cartItems?.length ? (
          <Typography variant="h6" gutterBottom>
            Cart is empty
          </Typography>
        ) : (
          <Stack justifyContent={"space-between"} height="100%">
            <Box>
              {cartItems.map((item, index) => (
                <Stack
                  key={item.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <span>
                    {item.item_name} ({item.size.slice(0, 1).toUpperCase()})
                  </span>
                  <span>
                    <Box>
                      <IconButton
                        aria-label="remove"
                        size="small"
                        variant="outlined"
                        onClick={() => updateQuantity("remove", index)}
                      >
                        -
                      </IconButton>
                      {item.quantity}
                      <IconButton
                        aria-label="add"
                        size="small"
                        variant="outlined"
                        onClick={() => updateQuantity("add", index)}
                      >
                        +
                      </IconButton>
                    </Box>
                  </span>
                  <span>${item.price * item.quantity}</span>
                </Stack>
              ))}
            </Box>
            <Stack sx={{ borderTop: "1px solid #ccc", pt: 2, mt: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                fontWeight="bold"
              >
                <span>Total</span>
                <span>
                  $
                  {cartItems.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )}
                </span>
              </Stack>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => placeOrder()}
              >
                Place Order
              </Button>
            </Stack>
          </Stack>
        )}
      </>
    );
  }, [cartItems, updateQuantity]);

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label="open cart"
          onClick={handleDrawerOpen}
          sx={{ position: "fixed", top: 28, right: 15, zIndex: 1 }}
        >
          <Badge
            badgeContent={cartItems?.reduce(
              (acc, item) => acc + item.quantity,
              0
            )}
            color="secondary"
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <Drawer
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
        >
          <Stack sx={{ width: 300, p: 2 }}>{renderCart()}</Stack>
        </Drawer>
      </>
    );
  }

  return (
    <Stack
      style={{
        width: "30%",
        px: 3,
        py: 2,
      }}
    >
      {renderCart()}
    </Stack>
  );
};

export default Cart;
