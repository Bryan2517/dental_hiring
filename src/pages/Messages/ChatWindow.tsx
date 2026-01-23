import { useRef, useEffect, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, ArrowLeft, MoreVertical, Phone, Video, Paperclip, X, FileText, Download, Trash2, Copy, Reply, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import { cn } from '../../lib/utils'; // Keep importing cn for conditional classes if used

export default function ChatWindow() {
    const { activeConversation, messages, sendMessage, deleteMessage, messagesLoading, setActiveConversationId } = useChat();
    const { user, userRole } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; senderName: string } | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!activeConversation) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50 text-gray-500">
                <p>Select a conversation to start messaging</p>
            </div>
        );
    }

    const otherPartyName = userRole === 'seeker' ? activeConversation.organization?.org_name : activeConversation.seeker?.full_name;
    const otherPartyAvatar = userRole === 'seeker' ? activeConversation.organization?.logo_url : activeConversation.seeker?.avatar_url;

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() && !attachedFile) return;

        await sendMessage(newMessage, attachedFile || undefined);
        setNewMessage('');
        setAttachedFile(null);
        setReplyingTo(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        setActiveMenu(null);
    };

    const handleDeleteMessage = async (messageId: string) => {
        await deleteMessage(messageId);
        setActiveMenu(null);
    };

    return (
        <div className="flex h-full flex-col overflow-hidden bg-gray-50/50">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setActiveConversationId(null)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="relative h-10 w-10">
                        {otherPartyAvatar ? (
                            <img
                                src={otherPartyAvatar}
                                alt={otherPartyName}
                                className="h-full w-full rounded-lg object-contain border border-gray-100 bg-white p-0.5"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500 font-semibold border border-gray-200">
                                {otherPartyName?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{otherPartyName}</h3>
                        <p className="text-xs text-gray-500">{activeConversation.job?.title || 'General Inquiry'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-400">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0 p-4 scroll-smooth">
                {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, index) => {
                            const isMe = msg.senderId === user?.id;
                            const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                            return (
                                <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn("flex max-w-[70%] items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                        {!isMe && (
                                            <div className="flex-shrink-0 w-8">
                                                {showAvatar && (
                                                    <div className="h-8 w-8 overflow-hidden rounded-lg border border-gray-100 bg-white">
                                                        {otherPartyAvatar ? (
                                                            <img src={otherPartyAvatar} className="h-full w-full object-contain p-0.5" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-500 font-medium">
                                                                {otherPartyName?.[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="relative group">
                                            <div
                                                className={cn(
                                                    "relative rounded-2xl px-4 py-2 text-sm shadow-sm",
                                                    isMe
                                                        ? "bg-brand text-white rounded-br-none"
                                                        : "bg-white text-gray-900 rounded-bl-none"
                                                )}
                                            >
                                                <div className="flex flex-wrap items-end gap-x-2">
                                                    <span>{msg.content}</span>
                                                    <span className={cn("text-[10px] leading-none mb-0.5", isMe ? "text-white/70" : "text-gray-400")}>
                                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                                    </span>
                                                </div>
                                                {msg.attachmentUrl && (
                                                    <a
                                                        href={msg.attachmentUrl}
                                                        download={msg.attachmentName || 'file'}
                                                        className={cn(
                                                            "mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition",
                                                            isMe
                                                                ? "border-white/20 bg-white/10 hover:bg-white/20"
                                                                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                                                        )}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span className="flex-1 truncate">{msg.attachmentName || 'File'}</span>
                                                        {msg.attachmentSize && (
                                                            <span className="text-[10px]">({formatFileSize(msg.attachmentSize)})</span>
                                                        )}
                                                        <Download className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                            {/* Context Menu */}
                                            <div className={cn(
                                                "absolute -top-2 -right-2 transition-opacity",
                                                activeMenu === msg.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                            )}>
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === msg.id ? null : msg.id)}
                                                    className="p-1 rounded-full bg-white/90 shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                                                    title="Message options"
                                                >
                                                    <MoreHorizontal className="h-3 w-3 text-gray-600" />
                                                </button>

                                                {activeMenu === msg.id && (
                                                    <>
                                                        {/* Backdrop to close menu */}
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveMenu(null)}
                                                        />

                                                        {/* Dropdown Menu */}
                                                        <div className="absolute right-0 top-8 z-20 w-36 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                                                            <button
                                                                onClick={() => handleCopyMessage(msg.content)}
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                                <span>Copy</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingTo({
                                                                        id: msg.id,
                                                                        content: msg.content,
                                                                        senderName: isMe ? 'You' : (otherPartyName || 'Unknown')
                                                                    });
                                                                    setActiveMenu(null);
                                                                }}
                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Reply className="h-4 w-4" />
                                                                <span>Reply</span>
                                                            </button>
                                                            {isMe && (
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span>Delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
                {/* Reply Preview */}
                {replyingTo && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border-l-4 border-brand bg-gray-50 px-3 py-2">
                        <Reply className="h-4 w-4 text-brand" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">
                                Replying to {replyingTo.senderName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {replyingTo.content}
                            </p>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {attachedFile && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="flex-1 truncate text-sm text-gray-700">{attachedFile.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(attachedFile.size)})</span>
                        <button
                            onClick={() => setAttachedFile(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="shrink-0"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() && !attachedFile} className="rounded-full h-10 w-10 shrink-0">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
