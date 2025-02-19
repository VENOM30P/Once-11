import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ChatAdmin() {
  const { user } = useAuth();
  const { messages, connected, sendMessage } = useChat();
  const [messageText, setMessageText] = useState("");

  if (!user?.isAdmin) {
    return <div>Não autorizado</div>;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Chat de Suporte ao Cliente</h1>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="outline">Usuários</Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="outline">Produtos</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 p-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.isAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isAdmin
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="font-semibold">
                        {msg.isAdmin ? "Admin" : "Cliente"}
                      </span>
                      <span className="text-xs opacity-70">
                        {format(new Date(msg.timestamp), "HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="mt-1">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSend} className="mt-4 flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={!connected}
            />
            <Button type="submit" disabled={!connected}>
              Enviar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}