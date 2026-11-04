// Module Title: Shared Campus Chat & Messaging Interface
// Real-time messaging system for communication between campus members.

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
// Icons and date tools
import { MessageSquare, Send, User, Search, Plus, X, MoreVertical, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: number;
  title: string;
  avatar: string | null;
  role: string;
  lastMessage: string;
  updatedAt: string;
  otherUserId: number | null;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  isMe: boolean;
}

interface SearchUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export default function ChatInterface({
  userRole,
  lecturerCourses
}: {
  userRole?: string,
  lecturerCourses?: { id: number; code: string; name: string }[]
}) {
  // State for conversations and message history
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // State for user search and contact discovery
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom of the chat on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (activeConversation && activeConversation.id !== 0) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Retrieves all active conversations for the current user
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Retrieves messages for a specific conversation
  const fetchMessages = async (id: number) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/messages/conversations/${id}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Sends a new message to an existing or new conversation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || (!activeConversation && !showSearch)) return;

    setSending(true);
    try {
      const payload = activeConversation && activeConversation.id !== 0
        ? { conversationId: activeConversation.id, content: newMessage }
        : { recipientId: activeConversation?.otherUserId, content: newMessage };

      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');

        if (activeConversation?.id === 0) {
          setActiveConversation(prev => prev ? { ...prev, id: data.message.conversationId } : null);
        }

        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Prepares a conversation with a user found via search
  const startNewConversation = async (user: SearchUser) => {
    const existing = conversations.find(c => c.otherUserId === user.id);
    if (existing) {
      setActiveConversation(existing);
      setShowSearch(false);
      setSearchQuery('');
      return;
    }

    setActiveConversation({
      id: 0,
      title: user.name,
      avatar: user.avatar,
      role: user.role,
      lastMessage: '',
      updatedAt: new Date().toISOString(),
      otherUserId: user.id
    });
    setMessages([]);
    setShowSearch(false);
    setSearchQuery('');
  };

  // Search for users by name or email
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/messages/users?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  // Find students belonging to a specific course (Lecturer only)
  const handleSearchByCourse = async (courseId: number) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/lecturer/courses/students?courseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('Error searching course users:', error);
    } finally {
      setSearching(false);
    }
  };

  // Initial loading state spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Sidebar: Conversation List */}
      <Card className="w-80 flex flex-col bg-slate-900/50 border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-xs uppercase tracking-widest">Messages</h2>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-8 w-8 rounded-full"
              onClick={() => setShowSearch(true)}
            >
              <Plus className="w-4 h-4 text-indigo-400" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {conversations.length > 0 ? conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className={`p-4 cursor-pointer transition-all hover:bg-slate-800/50 ${activeConversation?.id === conv.id ? 'bg-slate-800/80 border-r-2 border-indigo-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden flex-shrink-0">
                  {conv.avatar ? (
                    <img src={conv.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm truncate">{conv.title}</h4>
                    <span className="text-[9px] text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-500">
              <p className="text-xs italic">No chats yet.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Main Chat Conversation Window */}
      <Card className="flex-1 flex flex-col bg-slate-900/50 border-slate-800 overflow-hidden relative">
        {activeConversation ? (
          <>
            {/* Selected contact header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                  {activeConversation.avatar ? (
                    <img src={activeConversation.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{activeConversation.title}</h3>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{activeConversation.role}</Badge>
                </div>
              </div>
              <button className="text-slate-500 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable message history area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
                </div>
              ) : messages.length > 0 ? messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] space-y-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-slate-500 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-xs">Start the conversation...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input and send area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/80 border-t border-slate-800">
              <div className="flex gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2 pr-1 items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none px-2"
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9 p-0 rounded-lg flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
            {/* Default view when no conversation is selected */}
            <div className="p-8 rounded-full bg-slate-800 mb-6">
              <MessageSquare className="w-16 h-16 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Select a conversation</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              Pick a chat from the left or start a new one to begin messaging.
            </p>
          </div>
        )}

        {/* User discovery search modal overlay */}
        {showSearch && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">New Conversation</h3>
              <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userRole === 'LECTURER' && lecturerCourses && lecturerCourses.length > 0 && (
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Select Unit to Find Students</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                   {lecturerCourses.map(c => (
                     <button
                       key={c.id}
                       onClick={() => handleSearchByCourse(c.id)}
                       className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-400 hover:border-indigo-500/50 transition-all"
                     >
                       {c.code}
                     </button>
                   ))}
                </div>
              </div>
            )}

            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search by name, email or role..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {searching ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => startNewConversation(user)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{user.name}</h4>
                      <p className="text-[10px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                    {user.role}
                  </Badge>
                </div>
              )) : searchQuery.length >= 2 ? (
                <p className="text-center text-slate-500 text-sm py-12">No users found.</p>
              ) : (
                <p className="text-center text-slate-500 text-xs py-12 italic">Type at least 2 characters to search...</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
