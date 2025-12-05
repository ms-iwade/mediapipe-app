import { Paper, Container, Grid } from "@mui/material";
import { WebcamView } from "./components/WebcamView";

const GestureControl = () => {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "black",
              minHeight: "480px",
              overflow: "hidden",
            }}
          >
            <WebcamView onGestureDetected={() => {}} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GestureControl;
