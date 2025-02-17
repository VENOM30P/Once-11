import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Shield, UserCog, Crown } from "lucide-react";

export default function UsersAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user?.isAdmin) {
    return <div>Não autorizado</div>;
  }

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const promoteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/users/${userId}/promote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário promovido a administrador com sucesso",
      });
    },
  });

  const premiumMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/users/${userId}/premium`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário promovido para Once 11+ Premium com sucesso",
      });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button variant="outline">Produtos</Button>
          </Link>
          <Link href="/admin/chat">
            <Button variant="outline">Chat</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((u) => (
          <Card key={u.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{u.username}</h3>
                </div>
                <div className="flex gap-2">
                  {u.isAdmin && (
                    <Shield className="h-5 w-5 text-primary" />
                  )}
                  {u.isPremium && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {!u.isAdmin && (
                  <Button
                    onClick={() => promoteMutation.mutate(u.id)}
                    disabled={promoteMutation.isPending}
                    className="w-full"
                  >
                    Promover a Administrador
                  </Button>
                )}
                {!u.isPremium && (
                  <Button
                    onClick={() => premiumMutation.mutate(u.id)}
                    disabled={premiumMutation.isPending}
                    variant="secondary"
                    className="w-full"
                  >
                    Promover para Once 11+ Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}