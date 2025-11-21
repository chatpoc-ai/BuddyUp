import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  MessageSquare, 
  Users, 
  User, 
  Send, 
  Sparkles, 
  Zap, 
  Trophy, 
  Crown, 
  ChevronLeft, 
  MoreHorizontal,
  Search,
  MapPin,
  Calendar,
  X
} from "lucide-react";

// --- Types ---

type UserType = {
  id: string;
  name: string;
  avatar: string;
  isVip?: boolean;
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  type?: 'text' | 'system' | 'match_card';
  matchData?: any; // For match cards
};

type ChatConversation = {
  id: string;
  type: '1v1' | 'group';
  name: string;
  avatar: string;
  members: UserType[]; // For group info
  lastMessage: string;
  lastTime: number;
  unread: number;
  messages: Message[];
};

type Tab = 'ai' | 'chats' | 'profile';

// --- Mock Data ---

const CURRENT_USER: UserType = {
  id: 'me',
  name: 'Alex',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  isVip: true
};

const MOCK_TASKS = [
  { id: 1, title: "Daily Login", reward: "10 Coins", done: true },
  { id: 2, title: "Chat with a new match", reward: "50 Coins", done: false },
  { id: 3, title: "Join a group activity", reward: "100 Coins", done: false },
];

// --- Helper Components ---

const Avatar = ({ src, size = "md", className = "" }: { src: string, size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20"
  };
  return (
    <img 
      src={src} 
      alt="avatar" 
      className={`rounded-full object-cover border-2 border-white shadow-sm ${sizeClasses[size]} ${className}`} 
    />
  );
};

const Badge = ({ children, color = "blue" }: { children?: React.ReactNode, color?: string }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${color}-100 text-${color}-600`}>
    {children}
  </span>
);

// --- Sub-Components (Defined outside App to prevent re-mounts) ---

// 1. AI Assistant View
const AiView = ({
  messages,
  input,
  setInput,
  onSend,
  isThinking,
  messagesEndRef,
  onOpenMatch
}: {
  messages: Message[],
  input: string,
  setInput: (s: string) => void,
  onSend: () => void,
  isThinking: boolean,
  messagesEndRef: React.RefObject<HTMLDivElement>,
  onOpenMatch: (id: string) => void
}) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="glass-panel pt-12 pb-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-800 tracking-tight">BuddyUp</h1>
            <p className="text-xs text-indigo-600 font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></span>
              AI Wingman Online
            </p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          if (msg.type === 'match_card') {
            return (
              <div key={msg.id} className="flex justify-start animate-fade-in">
                 <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-100">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar src={msg.matchData.avatar} size="md" />
                        <div>
                          <h3 className="font-bold text-gray-800">{msg.matchData.name}</h3>
                          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                            {msg.matchData.type === '1v1' ? '1v1 Match' : 'Group Match'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{msg.matchData.description}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onOpenMatch(msg.matchData.id)}
                        className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 rounded-xl shadow hover:bg-indigo-700 transition-colors"
                      >
                        Start Chatting
                      </button>
                    </div>
                  </div>
                 </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs mr-2 self-end mb-1 shadow-sm">
                  B
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isMe 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isThinking && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex space-x-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Try 'Find a gym buddy for tomorrow'..."
            className="w-full pl-4 pr-12 py-3.5 bg-gray-100 border-0 rounded-2xl text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button 
            onClick={onSend}
            className={`absolute right-2 p-2 rounded-xl transition-colors ${
              input.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'
            }`}
            disabled={!input.trim() || isThinking}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Chats List View
const ChatListView = ({
  conversations,
  onSelectChat,
  onSwitchTab
}: {
  conversations: ChatConversation[],
  onSelectChat: (id: string) => void,
  onSwitchTab: (tab: Tab) => void
}) => {
  const [filter, setFilter] = useState<'all' | '1v1' | 'group'>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredChats = conversations.filter(c => {
    const typeMatch = filter === 'all' || c.type === filter;
    const searchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && searchMatch;
  });

  return (
    <div className="flex flex-col h-full bg-white pb-20">
      <div className="pt-12 pb-4 px-6 border-b border-gray-100">
        
        {/* Search Header Toggle */}
        {isSearchOpen ? (
          <div className="flex items-center mb-6 h-10 animate-fade-in">
             <div className="flex-1 relative">
                <input 
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search size={16} className="absolute left-3.5 top-2.5 text-gray-500" />
             </div>
             <button 
               onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
               className="ml-3 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
             >
               <X size={20} />
             </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6 h-10">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        )}
        
        <div className="flex space-x-2">
          {(['all', '1v1', 'group'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === '1v1' ? 'Direct' : 'Groups'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            {searchQuery ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
                <p className="text-sm text-gray-500 mb-6">We couldn't find any messages matching "{searchQuery}".</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-indigo-600 font-medium text-sm hover:underline"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No messages yet</h3>
                <p className="text-sm text-gray-500 mb-6">Chat with BuddyUp AI to find new friends or groups!</p>
                <button 
                  onClick={() => onSwitchTab('ai')}
                  className="text-indigo-600 font-medium text-sm hover:underline"
                >
                  Go to Assistant
                </button>
              </>
            )}
          </div>
        ) : (
          filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="w-full px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-b border-gray-50/50"
            >
              <div className="relative">
                <Avatar src={chat.avatar} size="lg" />
                {chat.type === 'group' && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <div className="bg-purple-500 rounded-full p-1">
                      <Users size={10} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-800 truncate pr-4">{chat.name}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(chat.lastTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// 3. Active Conversation View
const ConversationView = ({
  chat,
  onBack,
  onSendMessage
}: {
  chat: ChatConversation,
  onBack: () => void,
  onSendMessage: (text: string) => void
}) => {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView();
  }, [chat.messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white pt-12 pb-3 px-4 shadow-sm flex items-center space-x-3 sticky top-0 z-20">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <Avatar src={chat.avatar} size="sm" />
        <div className="flex-1">
          <h2 className="font-bold text-gray-800 text-sm">{chat.name}</h2>
          <p className="text-xs text-gray-500">{chat.type === '1v1' ? 'Online' : `${Math.floor(Math.random() * 20) + 3} members`}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.messages.map(msg => {
            const isMe = msg.senderId === 'me';
            const isSystem = msg.senderId === 'system';
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">{msg.text}</span>
                </div>
              )
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && chat.type === 'group' && (
                  <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 self-end mb-1 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} alt="" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200 pb-safe">
        <div className="flex items-center space-x-2">
            <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-full disabled:bg-gray-300 disabled:text-gray-500"
            >
              <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

// 4. Profile View
const ProfileView = ({ user, tasks }: { user: UserType, tasks: typeof MOCK_TASKS }) => (
  <div className="flex flex-col h-full bg-gray-50 pb-20 overflow-y-auto">
    {/* Profile Header */}
    <div className="bg-white pb-8 pt-12 rounded-b-[2.5rem] shadow-sm">
      <div className="px-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <button className="text-indigo-600 font-medium text-sm">Settings</button>
        </div>
        
        <div className="flex items-center space-x-5">
          <div className="relative">
            <Avatar src={user.avatar} size="xl" className="border-4 border-indigo-50" />
            {user.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1.5 rounded-full border-2 border-white">
                <Crown size={14} fill="currentColor" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-2">Activity Enthusiast & Foodie</p>
            <div className="flex space-x-2">
                <Badge color="purple">Level 5</Badge>
                {user.isVip && <Badge color="yellow">VIP Member</Badge>}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Matches', val: '12' },
            { label: 'Groups', val: '4' },
            { label: 'Activities', val: '28' }
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-2xl">
              <div className="font-bold text-xl text-gray-800">{stat.val}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Membership Card */}
    <div className="mx-6 -mt-6 mb-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Crown size={18} className="text-yellow-400" fill="currentColor" />
            <span className="font-bold text-yellow-400 text-sm">Premium Member</span>
          </div>
          <p className="text-xs text-gray-300">Unlock unlimited matches & exclusive events.</p>
        </div>
        <button className="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-100">
          Manage
        </button>
      </div>
    </div>

    {/* Tasks Section */}
    <div className="px-6 mb-8">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
        <Zap size={18} className="text-yellow-500 mr-2" fill="currentColor" />
        Daily Tasks
      </h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {task.done && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <div className={`text-sm font-medium ${task.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</div>
                  <div className="text-xs text-indigo-500 font-semibold flex items-center mt-0.5">
                    <Trophy size={10} className="mr-1" />
                    {task.reward}
                  </div>
                </div>
              </div>
              <button className={`text-xs font-bold px-3 py-1.5 rounded-lg ${task.done ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-600'}`}>
                {task.done ? 'Claimed' : 'Claim'}
              </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  
  // Mock Data Initialization
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
        id: 'group-demo',
        type: 'group',
        name: 'Weekend Hikers 🏔️',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=hike',
        members: [],
        lastMessage: "Sam: The trail looks great for Sunday!",
        lastTime: Date.now() - 1000 * 60 * 15, // 15 mins ago
        unread: 2,
        messages: [
            { id: 'm1', senderId: 'Sam', text: 'The trail looks great for Sunday!', timestamp: Date.now() - 1000 * 60 * 15 }
        ]
    },
    {
        id: '1v1-demo',
        type: '1v1',
        name: 'Jordan Lee',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        members: [],
        lastMessage: "Hey! Are you still looking for a tennis partner?",
        lastTime: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
        unread: 1,
        messages: [
            { id: 'm2', senderId: 'Jordan', text: 'Hey! Are you still looking for a tennis partner?', timestamp: Date.now() - 1000 * 60 * 60 * 3 }
        ]
    }
  ]);
  
  // AI Chat State
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      senderId: 'ai', 
      text: "Hi Alex! Welcome to BuddyUp! I'm your AI Wingman. Tell me what activity you're looking to do? Maybe find a tennis partner or a hiking group?", 
      timestamp: Date.now() 
    }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Conversation State (for Chat Tab)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Scroll to bottom of AI chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  // --- AI Logic ---

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: aiInput,
      timestamp: Date.now()
    };

    // Update UI immediately
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");
    setIsAiThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Define the tool for matching
      const matchTool = {
        functionDeclarations: [{
          name: "find_match",
          description: "Find a social match for the user. Use this when the user explicitly expresses interest in finding a person or a group activity.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["1v1", "group"], description: "The type of match: 1v1 for single partner, group for activities." },
              activity: { type: Type.STRING, description: "The activity name (e.g., Tennis, Movie, Coding)." },
              description: { type: Type.STRING, description: "A short description of the matched entity." }
            },
            required: ["type", "activity", "description"]
          }
        }]
      };

      // Construct history for context from existing messages
      const history = aiMessages.map(m => {
        let text = m.text;
        // Convert custom UI cards to text representation for the model
        if (m.type === 'match_card' && m.matchData) {
            text = `[System: I have created a match for ${m.matchData.description}. The user can see it.]`;
        }
        return {
            role: m.senderId === 'me' ? 'user' : 'model',
            parts: [{ text: text }]
        };
      });

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: "You are 'BuddyUp', a friendly, enthusiastic social connectivity assistant. Your job is to help the user find friends or activities (aka 'Da-zi'). Be conversational. If the user wants to find someone or something, ask clarifying questions if needed, or use the 'find_match' tool to simulate finding a match.",
            tools: [matchTool]
        },
        history: history
      });

      const result = await chat.sendMessage({ message: userMsg.text });
      const response = result; // Response object is returned directly
      const calls = response.functionCalls;

      if (calls && calls.length > 0) {
        const call = calls[0];
        if (call.name === "find_match") {
          const args = call.args as any;
          await handleMatchCreation(args.type, args.activity, args.description);
          
          // Let the AI follow up after "finding" the match
          const followUp = await chat.sendMessage({
            message: [{
              functionResponse: {
                name: "find_match",
                response: { result: "success", message: "Match created successfully and added to database." },
                id: call.id
              }
            }]
          });
          
          const aiResponseText = followUp.text;
          if (aiResponseText) {
             setAiMessages(prev => [...prev, {
                id: Date.now().toString(),
                senderId: 'ai',
                text: aiResponseText,
                timestamp: Date.now()
             }]);
          }
        }
      } else {
        const text = response.text;
        if (text) {
            setAiMessages(prev => [...prev, {
            id: Date.now().toString(),
            senderId: 'ai',
            text: text,
            timestamp: Date.now()
            }]);
        }
      }

    } catch (error) {
      console.error(error);
      setAiMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: 'ai',
        text: "I'm having trouble connecting to the BuddyUp network right now. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleMatchCreation = async (type: '1v1' | 'group', activity: string, description: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const matchId = Date.now().toString();
    
    let newConversation: ChatConversation;

    if (type === '1v1') {
      newConversation = {
        id: matchId,
        type: '1v1',
        name: `Partner for ${activity}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchId}`,
        members: [],
        lastMessage: "Hey! I saw you're interested in " + activity,
        lastTime: Date.now(),
        unread: 1,
        messages: [
          { id: '1', senderId: 'them', text: `Hey! I saw you're interested in ${activity}. Let's chat!`, timestamp: Date.now() }
        ]
      };
    } else {
      newConversation = {
        id: matchId,
        type: 'group',
        name: `${activity} Squad`,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${matchId}`,
        members: [],
        lastMessage: "System: You joined the group.",
        lastTime: Date.now(),
        unread: 0,
        messages: [
          { id: '1', senderId: 'system', text: `You joined the ${activity} Squad. Say hello!`, timestamp: Date.now() }
        ]
      };
    }

    setConversations(prev => [newConversation, ...prev]);
    
    // Add a "Match Card" to the AI chat
    setAiMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: 'ai',
      text: "", // Empty text, card type
      type: 'match_card',
      timestamp: Date.now(),
      matchData: { ...newConversation, description }
    }]);
  };

  // Handle sending a message in a chat (1v1 or group)
  const handleChatMessage = (chatId: string, text: string) => {
    const newMsg: Message = {
        id: Date.now().toString(),
        senderId: 'me',
        text: text,
        timestamp: Date.now()
    };

    setConversations(prev => prev.map(c => {
        if (c.id === chatId) {
            return {
                ...c,
                messages: [...c.messages, newMsg],
                lastMessage: "You: " + text,
                lastTime: Date.now()
            };
        }
        return c;
    }));

    // Simulate reply
    const chat = conversations.find(c => c.id === chatId);
    if (chat) {
        setTimeout(() => {
            const replyMsg: Message = {
                id: (Date.now() + 1).toString(),
                senderId: 'them',
                text: chat.type === '1v1' ? "That sounds great! When are you free?" : "Welcome to the group everyone!",
                timestamp: Date.now()
            };
            
            setConversations(prev => prev.map(c => {
            if (c.id === chatId) {
                return {
                ...c,
                messages: [...c.messages, replyMsg],
                lastMessage: replyMsg.text,
                lastTime: Date.now()
                };
            }
            return c;
            }));
        }, 2000);
    }
  };

  const handleSelectChat = (id: string) => {
      // Mark as read
      setConversations(prev => prev.map(c => c.id === id ? {...c, unread: 0} : c));
      setActiveConversationId(id);
  };

  // --- Render Helpers ---

  const renderFooter = () => (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20">
      <button 
        onClick={() => setActiveTab('ai')} 
        className={`flex flex-col items-center space-y-1 ${activeTab === 'ai' ? 'text-indigo-600' : 'text-gray-400'}`}
      >
        <Sparkles size={24} fill={activeTab === 'ai' ? "currentColor" : "none"} />
        <span className="text-xs font-medium">BuddyUp</span>
      </button>
      <button 
        onClick={() => setActiveTab('chats')} 
        className={`flex flex-col items-center space-y-1 ${activeTab === 'chats' ? 'text-indigo-600' : 'text-gray-400'}`}
      >
        <div className="relative">
          <MessageSquare size={24} fill={activeTab === 'chats' ? "currentColor" : "none"} />
          {conversations.reduce((acc, c) => acc + c.unread, 0) > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {conversations.reduce((acc, c) => acc + c.unread, 0)}
            </span>
          )}
        </div>
        <span className="text-xs font-medium">Chats</span>
      </button>
      <button 
        onClick={() => setActiveTab('profile')} 
        className={`flex flex-col items-center space-y-1 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}
      >
        <User size={24} fill={activeTab === 'profile' ? "currentColor" : "none"} />
        <span className="text-xs font-medium">Profile</span>
      </button>
    </div>
  );

  // Determine current view
  const activeChat = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="h-full w-full max-w-md mx-auto bg-white relative shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        {activeConversationId && activeChat ? (
          <ConversationView 
            chat={activeChat}
            onBack={() => setActiveConversationId(null)}
            onSendMessage={(text) => handleChatMessage(activeChat.id, text)}
          />
        ) : (
          <>
            {activeTab === 'ai' && (
              <AiView 
                messages={aiMessages}
                input={aiInput}
                setInput={setAiInput}
                onSend={handleAiSend}
                isThinking={isAiThinking}
                messagesEndRef={messagesEndRef}
                onOpenMatch={(id) => {
                    setActiveConversationId(id);
                    setActiveTab('chats');
                }}
              />
            )}
            {activeTab === 'chats' && (
              <ChatListView 
                conversations={conversations}
                onSelectChat={handleSelectChat}
                onSwitchTab={setActiveTab}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileView user={CURRENT_USER} tasks={MOCK_TASKS} />
            )}
          </>
        )}
      </div>
      
      {/* Navigation - Hidden when in conversation */}
      {!activeConversationId && renderFooter()}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);