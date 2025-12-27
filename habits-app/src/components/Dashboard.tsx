import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { TicketModal } from './TicketModal';
import {
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Wrench,
  X,
  AlertTriangle,
  Flame,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Printer,
  HardDrive,
  Wifi,
  AppWindow,
  HelpCircle,
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  product: string | null;
  tier: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  resolution_notes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_review: { label: 'Under Review', color: '#f59e0b', icon: Clock },
  quote_sent: { label: 'Quote Sent', color: '#3b82f6', icon: DollarSign },
  paid: { label: 'Paid', color: '#22c55e', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: '#8b5cf6', icon: Wrench },
  completed: { label: 'Completed', color: '#22c55e', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#6b7280', icon: AlertCircle },
};

const TIER_CONFIG: Record<string, { label: string; price: string; color: string }> = {
  quick: { label: 'Quick Fix', price: '$49', color: '#22c55e' },
  standard: { label: 'Standard Fix', price: '$99', color: '#3b82f6' },
  complex: { label: 'Complex Fix', price: '$199', color: '#ef4444' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  low: { label: 'Low', color: '#6b7280', icon: Clock },
  medium: { label: 'Medium', color: '#3b82f6', icon: AlertCircle },
  high: { label: 'High', color: '#f59e0b', icon: AlertTriangle },
  urgent: { label: 'Urgent', color: '#ef4444', icon: Flame },
};

const PRODUCT_CONFIG: Record<string, { label: string; icon: typeof Laptop }> = {
  macbook: { label: 'MacBook', icon: Laptop },
  imac: { label: 'iMac / Mac', icon: Monitor },
  iphone: { label: 'iPhone', icon: Smartphone },
  ipad: { label: 'iPad', icon: Tablet },
  apple_watch: { label: 'Apple Watch', icon: Watch },
  printer: { label: 'Printer', icon: Printer },
  nas_storage: { label: 'NAS / Storage', icon: HardDrive },
  network: { label: 'Network / WiFi', icon: Wifi },
  software: { label: 'Software / Apps', icon: AppWindow },
  other: { label: 'Other', icon: HelpCircle },
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeTickets = tickets.filter(t => !['completed', 'cancelled'].includes(t.status));
  const completedTickets = tickets.filter(t => ['completed', 'cancelled'].includes(t.status));

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight mb-2">
          Support Dashboard
        </h1>
        <p className="text-[15px] text-[#6F6F6F]">
          View your support requests and their status.
        </p>
      </div>

      {/* New Request Button */}
      <motion.button
        onClick={() => setShowTicketModal(true)}
        className="w-full p-6 rounded-2xl mb-8 flex items-center justify-center gap-3 transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(59, 130, 246, 0.15)' }}
        >
          <Plus size={20} className="text-[#3b82f6]" />
        </div>
        <span className="text-[16px] font-medium text-[#3b82f6]">
          New Support Request
        </span>
      </motion.button>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
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
          <h3 className="text-[18px] font-medium mb-2">No support requests yet</h3>
          <p className="text-[14px] text-[#6F6F6F] mb-6">
            When you need help, submit a request and I'll get back to you.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Active Tickets */}
          {activeTickets.length > 0 && (
            <div>
              <h2 className="text-[13px] font-medium tracking-[0.05em] uppercase text-[#6F6F6F] mb-4">
                Active Requests ({activeTickets.length})
              </h2>
              <div className="space-y-3">
                {activeTickets.map((ticket, index) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    index={index}
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tickets */}
          {completedTickets.length > 0 && (
            <div>
              <h2 className="text-[13px] font-medium tracking-[0.05em] uppercase text-[#6F6F6F] mb-4">
                Completed ({completedTickets.length})
              </h2>
              <div className="space-y-3">
                {completedTickets.map((ticket, index) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    index={index}
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false);
          fetchTickets();
        }}
      />

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TicketCard = ({
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
  const priority = ticket.priority ? PRIORITY_CONFIG[ticket.priority] : null;
  const product = ticket.product ? PRODUCT_CONFIG[ticket.product] : null;
  const StatusIcon = status.icon;
  const ProductIcon = product?.icon || HelpCircle;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full p-5 rounded-2xl text-left transition-all hover:bg-white/[0.02]"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Product & Priority badges */}
          <div className="flex items-center gap-2 mb-2">
            {product && (
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px]"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              >
                <ProductIcon size={12} className="text-[#6F6F6F]" />
                <span className="text-[#A0A0A0]">{product.label}</span>
              </div>
            )}
            {priority && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px]"
                style={{
                  background: `${priority.color}15`,
                  color: priority.color,
                }}
              >
                {(() => {
                  const PriorityIcon = priority.icon;
                  return <PriorityIcon size={10} />;
                })()}
                <span>{priority.label}</span>
              </div>
            )}
          </div>

          <h3 className="text-[15px] font-medium text-[#F5F5F5] mb-1 truncate">
            {ticket.title}
          </h3>
          <p className="text-[13px] text-[#6F6F6F] line-clamp-2">
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
              {tier.label} • {tier.price}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#4F4F4F]">
        Submitted {new Date(ticket.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </div>
    </motion.button>
  );
};

const TicketDetailModal = ({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) => {
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending_review;
  const tier = ticket.tier ? TIER_CONFIG[ticket.tier] : null;
  const priority = ticket.priority ? PRIORITY_CONFIG[ticket.priority] : null;
  const product = ticket.product ? PRODUCT_CONFIG[ticket.product] : null;
  const StatusIcon = status.icon;
  const ProductIcon = product?.icon || HelpCircle;

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[520px] max-h-[80vh] overflow-y-auto p-8 rounded-3xl"
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
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
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
              {priority && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    background: `${priority.color}15`,
                    color: priority.color,
                  }}
                >
                  {(() => {
                    const PriorityIcon = priority.icon;
                    return <PriorityIcon size={12} />;
                  })()}
                  {priority.label}
                </div>
              )}
              {tier && (
                <div
                  className="text-[11px] font-medium px-2 py-1 rounded-full"
                  style={{
                    background: `${tier.color}15`,
                    color: tier.color,
                  }}
                >
                  {tier.label}
                </div>
              )}
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

        {/* Product */}
        {product && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-6"
            style={{ background: 'rgba(255, 255, 255, 0.03)' }}
          >
            <ProductIcon size={20} className="text-[#6F6F6F]" />
            <span className="text-[14px] text-[#A0A0A0]">{product.label}</span>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-[12px] font-medium text-[#6F6F6F] uppercase tracking-wide mb-2">
            Description
          </h3>
          <p className="text-[14px] text-[#A0A0A0] leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Price if set */}
        {tier && ticket.price && (
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#A0A0A0]">{tier.label}</span>
              <span className="text-[20px] font-semibold text-[#F5F5F5]">
                ${(ticket.price / 100).toFixed(0)}
              </span>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        {ticket.admin_notes && (
          <div className="mb-6">
            <h3 className="text-[12px] font-medium text-[#6F6F6F] uppercase tracking-wide mb-2">
              Notes from Jonas
            </h3>
            <p className="text-[14px] text-[#A0A0A0] leading-relaxed whitespace-pre-wrap">
              {ticket.admin_notes}
            </p>
          </div>
        )}

        {/* Resolution Notes */}
        {ticket.resolution_notes && (
          <div className="mb-6">
            <h3 className="text-[12px] font-medium text-[#22c55e] uppercase tracking-wide mb-2">
              Resolution
            </h3>
            <p className="text-[14px] text-[#A0A0A0] leading-relaxed whitespace-pre-wrap">
              {ticket.resolution_notes}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-[#1F1F1F] text-[12px] text-[#4F4F4F]">
          <p>Submitted: {new Date(ticket.created_at).toLocaleString()}</p>
          {ticket.updated_at !== ticket.created_at && (
            <p>Last updated: {new Date(ticket.updated_at).toLocaleString()}</p>
          )}
        </div>
      </motion.div>
    </>
  );
};
