import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Wrench,
  X,
  Send,
  ChevronDown,
  User,
  Mail,
} from 'lucide-react';

interface Ticket {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  description: string;
  status: string;
  tier: string | null;
  price: number | null;
  platform: string | null;
  device_info: string | null;
  admin_notes: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_review: { label: 'Under Review', color: '#f59e0b', icon: Clock },
  quote_sent: { label: 'Quote Sent', color: '#3b82f6', icon: DollarSign },
  paid: { label: 'Paid', color: '#22c55e', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: '#8b5cf6', icon: Wrench },
  completed: { label: 'Completed', color: '#22c55e', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#6b7280', icon: AlertCircle },
};

const TIER_CONFIG: Record<string, { label: string; price: number; color: string }> = {
  quick: { label: 'Quick Fix', price: 4900, color: '#22c55e' },
  standard: { label: 'Standard Fix', price: 9900, color: '#3b82f6' },
  complex: { label: 'Complex Fix', price: 19900, color: '#ef4444' },
};

const STATUS_OPTIONS = [
  { value: 'pending_review', label: 'Under Review' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const AdminTicketsView = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    fetchTickets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'active') {
      return !['completed', 'cancelled'].includes(ticket.status);
    }
    if (filter === 'completed') {
      return ['completed', 'cancelled'].includes(ticket.status);
    }
    return true;
  });

  const ticketCounts = {
    all: tickets.length,
    active: tickets.filter((t) => !['completed', 'cancelled'].includes(t.status)).length,
    completed: tickets.filter((t) => ['completed', 'cancelled'].includes(t.status)).length,
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight mb-2">
          Admin Dashboard
        </h1>
        <p className="text-[15px] text-[#6F6F6F]">
          Manage all support requests and assign pricing tiers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['active', 'all', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
            style={{
              background: filter === f ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: filter === f ? '#3b82f6' : '#6F6F6F',
              border: `1px solid ${filter === f ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({ticketCounts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          >
            <CheckCircle size={28} className="text-[#6F6F6F]" />
          </div>
          <h3 className="text-[18px] font-medium mb-2">No tickets found</h3>
          <p className="text-[14px] text-[#6F6F6F]">
            {filter === 'active' ? 'All caught up!' : 'No tickets yet.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket, index) => (
            <AdminTicketCard
              key={ticket.id}
              ticket={ticket}
              index={index}
              onClick={() => setSelectedTicket(ticket)}
            />
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <AdminTicketModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={fetchTickets}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminTicketCard = ({
  ticket,
  index,
  onClick,
}: {
  ticket: Ticket;
  index: number;
  onClick: () => void;
}) => {
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending_review;
  const tier = ticket.tier ? TIER_CONFIG[ticket.tier] : null;
  const StatusIcon = status.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="w-full p-5 rounded-2xl text-left transition-all hover:bg-white/[0.02]"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User size={12} className="text-[#6F6F6F]" />
            <span className="text-[12px] text-[#6F6F6F]">{ticket.user_name}</span>
            <span className="text-[10px] text-[#4F4F4F]">•</span>
            <span className="text-[12px] text-[#4F4F4F]">{ticket.user_email}</span>
          </div>
          <h3 className="text-[15px] font-medium text-[#F5F5F5] mb-1 truncate">
            {ticket.title}
          </h3>
          <p className="text-[13px] text-[#6F6F6F] line-clamp-1">
            {ticket.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              background: `${status.color}15`,
              color: status.color,
            }}
          >
            <StatusIcon size={12} />
            {status.label}
          </div>

          {tier && (
            <div
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{
                background: `${tier.color}15`,
                color: tier.color,
              }}
            >
              {tier.label} • ${(tier.price / 100).toFixed(0)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#4F4F4F]">
        Submitted{' '}
        {new Date(ticket.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </div>
    </motion.button>
  );
};

const AdminTicketModal = ({
  ticket,
  onClose,
  onUpdate,
}: {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [status, setStatus] = useState(ticket.status);
  const [tier, setTier] = useState<string | null>(ticket.tier);
  const [adminNotes, setAdminNotes] = useState(ticket.admin_notes || '');
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolution_notes || '');
  const [saving, setSaving] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTierDropdown, setShowTierDropdown] = useState(false);

  const currentStatus = STATUS_CONFIG[status] || STATUS_CONFIG.pending_review;
  const currentTier = tier ? TIER_CONFIG[tier] : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        status,
        tier,
        price: tier ? TIER_CONFIG[tier].price : null,
        admin_notes: adminNotes || null,
        resolution_notes: resolutionNotes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticket.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-8 rounded-3xl"
        style={{
          background: 'rgba(20, 20, 20, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 32px 100px -20px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} className="text-[#6F6F6F]" />
              <span className="text-[13px] text-[#6F6F6F]">{ticket.user_email}</span>
            </div>
            <h2 className="text-[20px] font-semibold text-[#F5F5F5]">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/8 text-[#6F6F6F]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-[12px] font-medium text-[#6F6F6F] uppercase tracking-wide mb-2">
            Description
          </h3>
          <p className="text-[14px] text-[#A0A0A0] leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Status & Tier Dropdowns */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Status Dropdown */}
          <div className="relative">
            <label className="text-[12px] font-medium text-[#6F6F6F] uppercase tracking-wide block mb-2">
              Status
            </label>
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowTierDropdown(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-[14px] transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: currentStatus.color,
              }}
            >
              <span>{currentStatus.label}</span>
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {showStatusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl z-10"
                  style={{
                    background: 'rgba(30, 30, 30, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatus(opt.value);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-[14px] hover:bg-white/5 transition-colors"
                      style={{
                        color: STATUS_CONFIG[opt.value]?.color || '#F5F5F5',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tier Dropdown */}
          <div className="relative">
            <label className="text-[12px] font-medium text-[#6F6F6F] uppercase tracking-wide block mb-2">
              Tier
            </label>
            <button
              onClick={() => {
                setShowTierDropdown(!showTierDropdown);
                setShowStatusDropdown(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-[14px] transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: currentTier?.color || '#6F6F6F',
              }}
            >
              <span>
                {currentTier
                  ? `${currentTier.label} ($${(currentTier.price / 100).toFixed(0)})`
                  : 'Select tier...'}
              </span>
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {showTierDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl z-10"
                  style={{
                    background: 'rgba(30, 30, 30, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {Object.entries(TIER_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTier(key);
                        setShowTierDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-[14px] hover:bg-white/5 transition-colors flex items-center justify-between"
                      style={{ color: config.color }}
                    >
                      <span>{config.label}</span>
                      <span className="text-[12px] opacity-70">
                        ${(config.price / 100).toFixed(0)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="mb-6">
          <label className="text-[12px] font-medium text-[#6F6F6F] uppercase tracking-wide block mb-2">
            Notes to Customer
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes that the customer will see..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-[14px] resize-none outline-none transition-all focus:ring-2 focus:ring-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#F5F5F5',
            }}
          />
        </div>

        {/* Resolution Notes */}
        <div className="mb-8">
          <label className="text-[12px] font-medium text-[#22c55e] uppercase tracking-wide block mb-2">
            Resolution Notes
          </label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Add resolution notes when completing..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-[14px] resize-none outline-none transition-all focus:ring-2 focus:ring-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#F5F5F5',
            }}
          />
        </div>

        {/* Device Info */}
        {ticket.device_info && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
            <h3 className="text-[11px] font-medium text-[#4F4F4F] uppercase tracking-wide mb-1">
              Device Info
            </h3>
            <p className="text-[12px] text-[#6F6F6F] break-all">{ticket.device_info}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-xl text-[15px] font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: 'rgba(59, 130, 246, 0.9)',
            color: '#fff',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Send size={16} />
              Save Changes
            </>
          )}
        </button>

        {/* Timestamps */}
        <div className="mt-6 pt-4 border-t border-[#1F1F1F] text-[12px] text-[#4F4F4F]">
          <p>Submitted: {new Date(ticket.created_at).toLocaleString()}</p>
          {ticket.updated_at !== ticket.created_at && (
            <p>Last updated: {new Date(ticket.updated_at).toLocaleString()}</p>
          )}
        </div>
      </motion.div>
    </>
  );
};
