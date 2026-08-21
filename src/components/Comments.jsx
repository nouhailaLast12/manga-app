import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, Send, Trash2, Loader2, User } from 'lucide-react';

export default function Comments({ mangaId, chapterId = null, session, onOpenAuth }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  const fetchComments = async () => {
    try {
      let query = supabase
        .from('comments')
        .select(`
          id,
          manga_id,
          chapter_id,
          user_id,
          content,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('manga_id', mangaId)
        .order('created_at', { ascending: false });

      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mangaId) fetchComments();
  }, [mangaId, chapterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        manga_id: mangaId,
        user_id: session.user.id,
        content: newComment.trim(),
      };

      if (chapterId) {
        payload.chapter_id = chapterId;
      }

      const { error } = await supabase.from('comments').insert([payload]);

      if (error) throw error;

      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="mt-10 bg-[#141824] border border-pink-500/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-pink-400" />
        <h3 className="text-lg font-bold text-white">Comments ({comments.length})</h3>
      </div>

      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              session ? 'Write a comment...' : 'Log in to leave a comment'
            }
            className="flex-1 bg-[#0a0c10] border border-pink-500/10 focus:border-pink-500/40 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Post
              </>
            )}
          </button>
        </div>
      </form>

      
      {loading ? (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const profile = comment.profiles;
            const authorName = profile?.username || session?.user?.email?.split('@')[0] || 'User';
            const avatarUrl = profile?.avatar_url;
            const isOwner = session?.user?.id === comment.user_id;

            return (
              <div
                key={comment.id}
                className="bg-[#0a0c10]/60 border border-pink-500/5 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={authorName}
                      className="w-8 h-8 rounded-full object-cover border border-pink-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-xs text-pink-400 uppercase">
                      {authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-200">
                        {authorName}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}