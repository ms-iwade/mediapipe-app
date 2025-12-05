import { useRouteError, isRouteErrorResponse } from "react-router";
import { Box, Typography, Button } from "@mui/material";

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);

  let errorMessage = "予期せぬエラーが発生しました。";

  if (isRouteErrorResponse(error)) {
    // ルーティングエラー（404など）
    errorMessage = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    // その他のエラー
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {errorMessage}
      </Typography>
      <Button variant="text" onClick={() => (window.location.href = "/")}>
        再読み込み
      </Button>
    </Box>
  );
};
