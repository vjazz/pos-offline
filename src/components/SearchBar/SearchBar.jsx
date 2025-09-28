import { FormControl, MenuItem, Select, Stack, TextField } from "@mui/material";
import React, { useEffect } from "react";

const SearchBar = ({ categories, filterCategoryName, onSearchFilter }) => {
  const [value, setValue] = React.useState("");
  const [foodCategory, setFoodCategory] = React.useState(filterCategoryName);

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchFilter(value, foodCategory);
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [value, onSearchFilter]);

  const handleOnChange = (e) => {
    setValue(e.target.value);
  };

  const onHandleFilter = (e) => {
    setFoodCategory(e.target.value);
  };

  useEffect(() => {
    onSearchFilter(value, foodCategory);
  }, [foodCategory, onSearchFilter]);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        id="outlined-basic"
        label="Search Food"
        variant="outlined"
        placeholder="search what you like"
        value={value}
        onChange={handleOnChange}
      />
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <Select
          value={foodCategory}
          onChange={onHandleFilter}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          <MenuItem value="All">All</MenuItem>
          {categories?.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default SearchBar;
