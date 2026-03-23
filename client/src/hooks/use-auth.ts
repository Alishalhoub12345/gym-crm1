import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, setToken, removeToken, getToken } from "@/lib/queryClient";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "owner" | "admin" | "coach" | "member" | "dietitian";
  branchId: number | null;
  status: string;
}

export function useAuth() {
  const hasToken = !!getToken();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const logout = () => {
    removeToken();
    queryClient.clear();
    window.location.href = "/login";
  };

  return {
    user: hasToken ? user ?? null : null,
    isLoading: hasToken && isLoading,
    loginMutation,
    logout,
  };
}

export function useHasRole(...roles: string[]) {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}
