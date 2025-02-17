import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentDialogProps {
  productName: string;
  price: number;
  children: React.ReactNode;
}

export function PaymentDialog({ productName, price, children }: PaymentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cupom, setCupom] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [showSummary, setShowSummary] = useState(false);
  const [open, setOpen] = useState(false);

  // Cálculos do pagamento
  const desconto = cupom === "ONCE11" ? 0.1 : 0; // 10% de desconto
  const precoComDesconto = price * (1 - desconto);
  const juros = !user?.isAdmin && parseInt(parcelas) > 1 ? 0.02 : 0;
  const precoFinal = precoComDesconto * (1 + juros * parseInt(parcelas));
  const valorParcela = precoFinal / parseInt(parcelas);
  const economiaPremium = !user?.isAdmin && parseInt(parcelas) > 1 ? 
    (precoComDesconto * juros * parseInt(parcelas)) : 0;

  const handlePay = () => {
    toast({
      title: "Pagamento Realizado com Sucesso!",
      description: `Valor total: R$ ${precoFinal.toFixed(2)} em ${parcelas}x de R$ ${valorParcela.toFixed(2)}${juros > 0 ? " com juros" : " sem juros"}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Compra - {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Cupom de Desconto</Label>
            <Input 
              placeholder="Digite seu cupom" 
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
            />
            {cupom === "ONCE11" && (
              <p className="text-sm text-green-500 mt-1">Cupom válido! 10% de desconto aplicado.</p>
            )}
          </div>
          <div>
            <Label>Número de Parcelas</Label>
            <Select value={parcelas} onValueChange={setParcelas}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x de R$ {price.toFixed(2)}</SelectItem>
                <SelectItem value="2">2x de R$ {(price/2).toFixed(2)}{!user?.isAdmin && " + juros"}</SelectItem>
                <SelectItem value="3">3x de R$ {(price/3).toFixed(2)}{!user?.isAdmin && " + juros"}</SelectItem>
                <SelectItem value="4">4x de R$ {(price/4).toFixed(2)}{!user?.isAdmin && " + juros"}</SelectItem>
                <SelectItem value="5">5x de R$ {(price/5).toFixed(2)}{!user?.isAdmin && " + juros"}</SelectItem>
              </SelectContent>
            </Select>
            {!user?.isAdmin && parseInt(parcelas) > 1 && (
              <p className="text-sm text-yellow-500 mt-1">
                Assine o Once 11+ Premium para parcelar sem juros!
              </p>
            )}
          </div>

          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Resumo da Compra</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Valor Original:</span>
                  <span>R$ {price.toFixed(2)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Desconto (10%):</span>
                    <span>- R$ {(price * desconto).toFixed(2)}</span>
                  </div>
                )}
                {juros > 0 && (
                  <div className="flex justify-between text-yellow-500">
                    <span>Juros ({(juros * 100).toFixed(0)}% a.m.):</span>
                    <span>+ R$ {(precoFinal - precoComDesconto).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Valor Final:</span>
                  <span>R$ {precoFinal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor da Parcela:</span>
                  <span>{parcelas}x de R$ {valorParcela.toFixed(2)}</span>
                </div>
                {economiaPremium > 0 && (
                  <div className="mt-4 p-2 bg-primary/10 rounded-md">
                    <p className="text-primary font-semibold">
                      Economia Premium: R$ {economiaPremium.toFixed(2)}
                    </p>
                    <p className="text-xs">
                      Assine o Once 11+ e economize nos juros!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handlePay}>
            Pagar Agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}