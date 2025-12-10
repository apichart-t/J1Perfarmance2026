import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { Project, Report } from '../types';

interface ChatBotProps {
  projects: Project[];
  reports: Report[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const ChatBot: React.FC<ChatBotProps> = ({ projects, reports }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const initChat = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const context = `
      ข้อมูลโครงการ (Projects Data):
      ${JSON.stringify(projects.map(p => ({
        name: p.project_name,
        unit: p.unit_name,
        budget: p.budget,
        dates: `${p.start_date} to ${p.end_date}`
      })))}

      รายงานความคืบหน้า (Reports Data):
      ${JSON.stringify(reports.map(r => ({
        project: r.project_name,
        date: r.report_date,
        progress: r.progress_percent + '%',
        past: r.past_result,
        next: r.next_plan,
        problems: r.problems
      })))}
      `;

      const instruction = `
      คุณคือผู้เชี่ยวชาญด้านการบริหารความเสี่ยงของหน่วยงานภาครัฐ (Government Risk Management Expert)
      
      หน้าที่ของคุณคือการให้คำปรึกษาและวิเคราะห์ความเสี่ยงของโครงการต่างๆ ตามข้อมูลที่ได้รับ
      
      เมื่อผู้ใช้ถามเกี่ยวกับโครงการ ให้วิเคราะห์ตามหัวข้อต่อไปนี้:
      1. ความเสี่ยงด้านงบประมาณ (Budget Risk)
      2. ความเสี่ยงด้านบุคลากร (Personnel Risk)
      3. ความเสี่ยงด้านระยะเวลา (Timeline Risk)
      4. ความเสี่ยงด้านกฎหมาย/ระเบียบ (Legal/Compliance Risk)
      5. ความเสี่ยงด้านภาพลักษณ์องค์กร (Reputation Risk)

      สำหรับแต่ละหัวข้อ ให้ประเมิน:
      - ระดับความรุนแรง (Impact): 1-5
      - โอกาสเกิด (Likelihood): 1-5
      
      และสรุปเป็น Risk Matrix พร้อมแนวทางป้องกันเชิงนโยบาย

      ข้อมูลบริบทของโครงการปัจจุบัน:
      ${context}

      จงตอบคำถามด้วยภาษาไทยที่สุภาพ เป็นทางการ และเป็นมืออาชีพแบบทหาร/ราชการ
      `;

      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: instruction,
        },
      });

      // Add initial welcome message if empty
      if (messages.length === 0) {
        setMessages([
          {
            id: 'init',
            role: 'model',
            text: 'สวัสดีครับ ผมคือผู้ช่วยอัจฉริยะด้านการบริหารความเสี่ยง (AI Risk Advisor) \nท่านต้องการให้ผมวิเคราะห์ความเสี่ยงของโครงการใด หรือต้องการคำแนะนำด้านการบริหารงานบุคคลครับ?',
            timestamp: new Date()
          }
        ]);
      }
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  };

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      initChat();
    }
    // We intentionally don't add projects/reports to dependency array to avoid resetting chat on small updates
    // unless the chat is closed and reopened.
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) await initChat();
      
      const result = await chatSessionRef.current?.sendMessage({ message: userText });
      const responseText = result?.text || 'ขออภัย ไม่สามารถประมวลผลได้ในขณะนี้';
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI กรุณาลองใหม่อีกครั้ง",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl z-50 transition-all transform hover:scale-105 flex items-center gap-2 border border-emerald-400/50"
        >
          <Sparkles size={24} />
          <span className="font-semibold hidden md:block">AI Risk Advisor</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[80vh] md:h-[600px] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg shadow-lg">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">AI Risk Advisor</h3>
                <p className="text-emerald-400 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Gemini 3 Pro
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors hover:bg-slate-700 rounded-full p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/95 scrollbar-thin scrollbar-thumb-slate-600">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-2xl p-3 rounded-bl-none border border-slate-600">
                  <Loader2 className="animate-spin text-emerald-500" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="พิมพ์ข้อความที่นี่..."
                className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all shadow-lg active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;