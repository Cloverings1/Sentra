import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface DiamondSpots {
  totalSpots: number;
  spotsTaken: number;
  spotsRemaining: number;
  loading: boolean;
}

export const useDiamondSpots = (): DiamondSpots => {
  const [spots, setSpots] = useState<DiamondSpots>({
    totalSpots: 5,
    spotsTaken: 0,
    spotsRemaining: 5,
    loading: true,
  });

  useEffect(() => {
    // Fetch initial count
    const fetchSpots = async () => {
      const { data, error } = await supabase
        .from('diamond_spots_view')
        .select('*')
        .single();

      if (!error && data) {
        setSpots({
          totalSpots: data.total_spots,
          spotsTaken: data.spots_taken,
          spotsRemaining: data.spots_remaining,
          loading: false,
        });
      } else {
        setSpots(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSpots();

    // Subscribe to real-time changes on user_profiles table
    const channel = supabase
      .channel('diamond-spots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: 'subscription_status=eq.diamond',
        },
        () => {
          // Refetch when diamond users change
          fetchSpots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return spots;
};
