import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Clock, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_value: any;
  new_value: any;
  user_id: string | null;
  created_at: string;
}

export default function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchLog(); }, []);

  const fetchLog = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) setEntries(data as unknown as AuditEntry[]);
    setLoading(false);
  };

  const filtered = filter
    ? entries.filter(e =>
        e.action.toLowerCase().includes(filter.toLowerCase()) ||
        e.entity_type?.toLowerCase().includes(filter.toLowerCase())
      )
    : entries;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Every admin action is recorded here.</p>
        </div>
        <button
          onClick={fetchLog}
          className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by action or entity type..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-card/60 border border-border/30 text-foreground outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card/60 border border-border/30 rounded-2xl p-8 text-center">
          <ScrollText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No audit entries found.</p>
        </div>
      ) : (
        <div className="bg-card/60 border border-border/30 rounded-2xl divide-y divide-border/20 overflow-hidden">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="px-5 py-3 flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                <ScrollText className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground">{entry.action}</span>
                  {entry.entity_type && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/30 text-muted-foreground">
                      {entry.entity_type}
                    </span>
                  )}
                </div>
                {(entry.old_value || entry.new_value) && (
                  <div className="flex gap-4 mt-1">
                    {entry.old_value && (
                      <span className="text-[10px] text-muted-foreground/60 font-mono">
                        old: {JSON.stringify(entry.old_value).slice(0, 60)}
                      </span>
                    )}
                    {entry.new_value && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        new: {JSON.stringify(entry.new_value).slice(0, 60)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(entry.created_at).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
