import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UserStats {
  interviewsCompleted: number;
  averageScore: number;
  atsScore: number;
  recentInterviews: Array<{
    id: string;
    date: string;
    score: number;
    position: string;
    status: string;
  }>;
}

export const useUserStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<UserStats>({
    interviewsCompleted: 0,
    averageScore: 0,
    atsScore: 0,
    recentInterviews: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch interviews from the interviews table (if it exists)
        const { data: interviews, error: interviewsError } = await supabase
          .from('interviews')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (interviewsError) {
          console.log('No interviews table found or error:', interviewsError);
          // If interviews table doesn't exist, use default data
          setStats({
            interviewsCompleted: 0,
            averageScore: 0,
            atsScore: 0,
            recentInterviews: []
          });
        } else if (interviews && interviews.length > 0) {
          const completedInterviews = interviews.filter(i => i.status === 'completed');
          const totalScore = completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0);
          const avgScore = completedInterviews.length > 0 ? Math.round(totalScore / completedInterviews.length) : 0;
          
          setStats({
            interviewsCompleted: completedInterviews.length,
            averageScore: avgScore,
            atsScore: 0, // ATS score would need to be calculated separately
            recentInterviews: interviews.map(i => ({
              id: i.id,
              date: new Date(i.created_at).toLocaleDateString(),
              score: i.score || 0,
              position: i.position || 'Interview',
              status: i.status || 'completed'
            }))
          });
        } else {
          setStats({
            interviewsCompleted: 0,
            averageScore: 0,
            atsScore: 0,
            recentInterviews: []
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setError('Failed to fetch user statistics');
        setStats({
          interviewsCompleted: 0,
          averageScore: 0,
          atsScore: 0,
          recentInterviews: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId]);

  return { stats, loading, error };
};
