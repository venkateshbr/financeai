import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI finance assistant. How can I help you today?', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const [sessionId] = useState(() => {
        const stored = localStorage.getItem('n8n_chat_session_id');
        if (stored) return stored;
        const newId = crypto.randomUUID();
        localStorage.setItem('n8n_chat_session_id', newId);
        return newId;
    });

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3156/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatInput: userMessage,
                    sessionId: sessionId
                })
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            // Assuming n8n returns { output: "text" } or { text: "text" } or similar. 
            // Adjust this based on actual n8n output structure.
            const botResponse = data.output || data.text || data.message || JSON.stringify(data);

            setMessages(prev => [...prev, { role: 'assistant', content: botResponse, timestamp: new Date() }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now.", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-background border border-border rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Finance Assistant</h3>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                                <Minimize2 className="w-4 h-4" />
                            </button> */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md text-muted-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn(
                                "flex gap-2 max-w-[85%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                                )}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-card border border-border rounded-tl-none"
                                )}>
                                    {msg.content}
                                    <span className={cn(
                                        "text-[10px] block mt-1 opacity-70",
                                        msg.role === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                                    )}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm bg-card text-card-foreground">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="p-3 rounded-2xl bg-card border border-border rounded-tl-none shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-border bg-background">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                        >
                            <input
                                type="text"
                                className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-muted-foreground"
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isLoading}
                                className={cn(
                                    "p-2 rounded-full transition-all duration-200",
                                    inputText.trim() && !isLoading
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transform hover:scale-105 active:scale-95"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                    <MessageSquare className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                </button>
            )}
        </div>
    );
}
