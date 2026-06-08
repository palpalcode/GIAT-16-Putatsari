import { useEffect, useRef } from "react";

const SECRET_KEYWORD = "pastword";

export function useSecretLogin(onSuccess: () => void) {
  const bufferRef = useRef<string>("");
  const pendingRef = useRef(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key.length !== 1) return;

      bufferRef.current += key;
      if (bufferRef.current.length > SECRET_KEYWORD.length * 2) {
        bufferRef.current = bufferRef.current.slice(-SECRET_KEYWORD.length * 2);
      }

      if (bufferRef.current.includes(SECRET_KEYWORD)) {
        if (pendingRef.current) return;
        pendingRef.current = true;
        bufferRef.current = "";

        fetch(`${import.meta.env.BASE_URL}api/auth/secret-login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Secret login failed");
            return res.json();
          })
          .then(() => {
            onSuccess();
          })
          .catch(() => {
            // silently fail
          })
          .finally(() => {
            pendingRef.current = false;
          });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSuccess]);
}
