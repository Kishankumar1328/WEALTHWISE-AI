import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    Send,
    Bot,
    User,
    Sparkles,
    Languages,
    Cpu,
    BrainCircuit,
    Zap,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { aiApi } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiAdvisorPage = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { id: 1, fullName: 'User' };
    const userFullName = user?.fullName || 'User';
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello ${userFullName.split(' ')[0]}! I'm your FinanceGuru AI Analyst. I've synced your latest financial data and I'm ready to help you optimize your finances. What's on your mind?`,
            id: 1
        }
    ]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('en');
    const scrollRef = useRef(null);

    const mutation = useMutation({
        mutationFn: (data) => aiApi.getAdvice(data),
        onSuccess: (res) => {
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.advice, id: Date.now() }]);
        },
        onError: (err) => {
            console.error('AI Analyst Error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I apologize, but I'm having trouble connecting to my central brain. Please check your connection or try again in a moment.",
                id: Date.now(),
                isError: true
            }]);
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || mutation.isPending) return;

        const newUserMessage = { role: 'user', content: input, id: Date.now() };
        setMessages(prev => [...prev, newUserMessage]);

        mutation.mutate({
            userId: user.id,
            query: input,
            language: language
        });

        setInput('');
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिंदी' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'kn', name: 'ಕನ್ನಡ' }
    ];

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col max-w-5xl mx-auto gap-6 text-black">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                        AI Financial Analyst
                        <div className="px-2 py-1 bg-brand/10 text-brand text-[10px] rounded-md border border-brand/20 animate-pulse">
                            ACTIVE
                        </div>
                    </h1>
                    <p className="text-slate-500 font-medium font-bold">Get personalized advice in your native language.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${language === lang.code ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10 scroll-smooth"
                >
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
                                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-sm transition-all ${msg.role === 'user'
                                            ? 'bg-brand text-white rounded-tr-none font-medium'
                                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 font-normal'
                                        }`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-3 mt-5 first:mt-0 text-brand-dark" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                                                hr: ({ node, ...props }) => <hr className="my-4 border-slate-100" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {mutation.isPending && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-brand rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-brand rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-brand rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span className="text-xs font-bold text-slate-400">Analyst is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-slate-100 relative z-10">
                    <div className="relative group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask about your budget, savings goals, or spending habits..."
                            className="w-full bg-slate-50 border-none rounded-[2rem] pl-6 pr-16 py-4 text-sm font-bold focus:ring-2 focus:ring-brand outline-none transition-all resize-none h-16 group-hover:bg-slate-100 text-black"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || mutation.isPending}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${input.trim() ? 'bg-brand text-white shadow-lg shadow-brand/30 scale-100' : 'bg-slate-200 text-slate-400 scale-90'}`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-6 opacity-60">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <BrainCircuit size={12} className="text-brand" />
                            Financial Analyst Persona
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-x border-slate-200 px-6">
                            <Cpu size={12} className="text-brand" />
                            Gemma 2B Powered
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Zap size={12} className="text-brand" />
                            Local LLM
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiAdvisorPage;
