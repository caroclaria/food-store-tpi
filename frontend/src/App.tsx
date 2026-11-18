import { useEffect } from "react";
import AppRouter from "@/routes/AppRouter";
import Toast from "@/shared/components/Toast";
import { useAuthStore } from "@/store/authStore";

// Verifica la sesión al montar (GET /auth/me): es la única llamada en un useEffect.
function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
