import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ShoppingCart, MessageCircle, Plus, Settings } from "lucide-react";
import { PaymentDialog } from "@/components/payment-dialog";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleSubscribe = () => {
    toast({
      title: "Assinatura Iniciada",
      description: "Bem-vindo ao Once 11+! Sua primeira caixa chegará em breve.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Once 11</h1>
              {!user?.isAdmin && (
                <span className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                  {user?.isPremium ? "Premium" : "Usuário Comum"}
                </span>
              )}
            </div>
            <div className="flex gap-4">
              {user?.isAdmin ? (
                <Link href="/admin/products">
                  <Button variant="secondary" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Painel do Administrador
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-primary mb-2">Once 11</h1>
              <p className="text-xl text-gray-400">Sua Experiência Esportiva</p>
            </div>
            <h2 className="text-3xl font-bold mb-4">Assine o Once 11+</h2>
            <p className="text-gray-300 mb-6">
              Receba mensalmente caixas surpresa com equipamentos esportivos premium
            </p>
            <Button onClick={handleSubscribe} size="lg">
              Assinar Agora
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Produtos em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {product.description}
                  </p>
                  <p className="font-bold">
                    R$ {(product.price / 100).toFixed(2)}
                  </p>
                </CardContent>
                <CardFooter>
                  <PaymentDialog 
                    productName={product.name}
                    price={product.price / 100}
                  >
                    <Button className="w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Comprar Agora
                    </Button>
                  </PaymentDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}