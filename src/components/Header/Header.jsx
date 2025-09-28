import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { Badge, Box, useMediaQuery } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const Header = ({ totalCart, syncStatus }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <AppBar position="static" sx={{ maxHeight: "10vh" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          POS System
        </Typography>
        <span style={{ marginRight: 5 }}>
          {syncStatus.isOnline ? (
            <WifiIcon sx={{ color: "aqua" }} fontSize="small" />
          ) : (
            <WifiOffIcon color="error" fontSize="small" />
          )}
        </span>
        <span> {syncStatus.isOnline ? "Online" : "Offline"}</span>
        {!isMobile ? (
          <IconButton color="inherit" aria-label="cart">
            <Badge badgeContent={totalCart} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        ) : (
          <Box sx={{ marginRight: 5 }}></Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
