import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

const formSchema = insertUserSchema.extend({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bem-vindo ao Once 11</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <AuthForm
                  mode="login"
                  onSubmit={(data) => loginMutation.mutate(data)}
                  isPending={loginMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="register">
                <AuthForm
                  mode="register"
                  onSubmit={(data) => registerMutation.mutate(data)}
                  isPending={registerMutation.isPending}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-8 bg-gray-900">
        <div className="max-w-lg mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Sua Experiência Esportiva</h1>
          <p className="text-lg text-gray-300 mb-8">
            Entre para o Once 11 e tenha acesso a equipamentos esportivos exclusivos. 
            Assine o Once 11+ para benefícios premium e caixas surpresa mensais.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-lg bg-gray-800">
              <h3 className="font-semibold mb-2">Produtos Premium</h3>
              <p className="text-sm text-gray-400">
                Acesso a equipamentos esportivos de alta qualidade
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800">
              <h3 className="font-semibold mb-2">Caixa Mensal Once 11+</h3>
              <p className="text-sm text-gray-400">
                Equipamentos esportivos surpresa entregues mensalmente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  onSubmit,
  isPending,
}: {
  mode: "login" | "register";
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isPending: boolean;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {mode === "login" ? "Entrar" : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
}