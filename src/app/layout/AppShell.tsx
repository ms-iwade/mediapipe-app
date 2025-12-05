import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "@shared/auth";
import { PageHeaderProvider } from "@shared/page-header";

const AppShellContent = () => {
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "info",
  });
  const navigate = useNavigate();
  const { userInfo, logout, error: authError } = useAuth();

  useEffect(() => {
    if (authError) {
      setSnackbar({ open: true, message: authError, severity: "error" });
    }
  }, [authError]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSnackbar({
        open: true,
        message: "ログアウトしました",
        severity: "success",
      });
      navigate("/");
    } catch (error) {
      setSnackbar({
        open: true,
        message: `ログアウトに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        severity: "error",
      });
    }
    handleUserMenuClose();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box display="flex">
      {/* フローティングユーザーメニュー */}
      {userInfo.isAuthenticated && (
        <Box
          sx={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 1400,
            color: "white",
          }}
        >
          <IconButton
            onClick={handleUserMenuOpen}
            sx={{
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
            }}
            aria-label="ユーザーメニューを開く"
            disableRipple
            disableFocusRipple
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem disabled>{userInfo.username}</MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon
                fontSize="small"
                sx={{ color: "error.main", mr: 1 }}
              />
              ログアウト
            </MenuItem>
          </Menu>
        </Box>
      )}

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          ml: 0,
          pb: 0,
          minHeight: "100vh",
          backgroundColor: "black",
        }}
      >
        <Outlet />
      </Box>

      {/* ボトムナビゲーション */}
      {/* {bottomNavigationItems.length > 0 && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: { xs: "block", md: "none" },
            zIndex: (theme) => theme.zIndex.appBar,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={handleBottomNavigationChange}
            showLabels
          >
            {bottomNavigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <BottomNavigationAction
                  key={item.id}
                  label={item.label}
                  disabled={item.disabled}
                  icon={
                    item.badge ? (
                      <Badge
                        badgeContent={item.badge.count}
                        color={item.badge.color}
                        aria-label={`${item.label} - ${item.badge.count}件の通知`}
                      >
                        <IconComponent />
                      </Badge>
                    ) : (
                      <IconComponent />
                    )
                  }
                />
              );
            })}
          </BottomNavigation>
        </Paper>
      )} */}

      {/* スナックバー（通知） */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export const AppShell = () => {
  return (
    <PageHeaderProvider>
      <AppShellContent />
    </PageHeaderProvider>
  );
};
