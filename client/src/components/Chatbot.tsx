import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type Message = {
  role: 'user' | 'bot';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: '¡Hola! Soy tu asistente de ventas. ¿En qué puedo ayudarte hoy? Tenemos planes de financiación increíbles para ti.' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/support/chat", { message });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    chatMutation.mutate(userMsg);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[350px] h-[500px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-primary flex justify-between items-center text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold">Asistente Virtual</span>
            </div>
            <Button size="icon" variant="ghost" className="hover:bg-white/10" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <Input 
              placeholder="Escribe un mensaje..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="bg-white/5 border-white/10"
            />
            <Button size="icon" onClick={handleSend} disabled={chatMutation.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          size="icon" 
          className="w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-transform bg-primary"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      )}
    </div>
  );
}
