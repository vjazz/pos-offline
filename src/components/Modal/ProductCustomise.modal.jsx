import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Modal from "@mui/material/Modal";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Typography from "@mui/material/Typography";
import { useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "280px",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ProductCustomiseModal({
  openModal,
  setOpenModal,
  customiseProduct,
  setCartData,
}) {
  const [size, setSize] = useState("small");
  const [instruction, setInstruction] = useState("");
  const handleClose = () => {
    setOpenModal(false);
  };

  const addToCart = () => {
    setCartData((prev) => [
      ...prev,
      {
        ...customiseProduct,
        size,
        instruction,
        quantity: 1,
      },
    ]);
    handleClose();
  };

  return (
    <div>
      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {customiseProduct?.item_name}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {customiseProduct?.description}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",

              "& > *": {
                my: 1,
              },
            }}
          >
            <ButtonGroup
              size="small"
              variant="outlined"
              aria-label="Basic button group"
              onClick={(e) => setSize(e.target.textContent.toLowerCase())}
            >
              <Button
                variant={size === "small" ? "contained" : "outlined"}
                key={"small"}
              >
                Small
              </Button>
              <Button
                variant={size === "medium" ? "contained" : "outlined"}
                key={"medium"}
              >
                Medium
              </Button>
              <Button
                variant={size === "large" ? "contained" : "outlined"}
                key={"large"}
              >
                Large
              </Button>
            </ButtonGroup>
          </Box>
          <TextareaAutosize
            aria-label="text area for special instructions"
            minRows={3}
            placeholder="special instructions"
            style={{ width: "100%" }}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
          <Box align="right" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => addToCart()}>
              Ok
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
