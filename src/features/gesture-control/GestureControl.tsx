import { Box } from "@mui/material";
import { WebcamView } from "./components/WebcamView";

const GestureControl = () => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        bgcolor: "black",
        overflow: "hidden",
      }}
    >
      <WebcamView onGestureDetected={() => {}} />
    </Box>
  );
};

export default GestureControl;
