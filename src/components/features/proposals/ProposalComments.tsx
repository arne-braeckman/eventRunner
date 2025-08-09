"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Lock, 
  Globe,
  User,
  Clock
} from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface Comment {
  _id: Id<"proposalComments">;
  content: string;
  isInternal: boolean;
  authorId?: Id<"users">;
  authorName?: string;
  authorEmail?: string;
  createdAt: number;
  updatedAt: number;
}

interface ProposalCommentsProps {
  proposalId: Id<"proposals">;
  comments: Comment[];
  isClientView?: boolean;
  clientName?: string;
  clientEmail?: string;
  onCommentAdded?: () => void;
}

export function ProposalComments({
  proposalId,
  comments,
  isClientView = false,
  clientName,
  clientEmail,
  onCommentAdded
}: ProposalCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(!isClientView);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = useMutation(api.proposals.addProposalComment);

  // Filter comments based on view
  const visibleComments = isClientView 
    ? comments.filter(c => !c.isInternal)
    : comments;

  // Sort comments by creation date (newest first)
  const sortedComments = [...visibleComments].sort((a, b) => b.createdAt - a.createdAt);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment({
        proposalId,
        content: newComment.trim(),
        isInternal: isClientView ? false : isInternal,
        authorName: isClientView ? clientName : undefined,
        authorEmail: isClientView ? clientEmail : undefined,
      });

      setNewComment("");
      onCommentAdded?.();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getAuthorInitials = (comment: Comment) => {
    if (comment.authorName) {
      return comment.authorName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments & Feedback
          {!isClientView && (
            <Badge variant="outline" className="ml-auto">
              {comments.length} total, {comments.filter(c => !c.isInternal).length} client visible
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        <div className="space-y-3">
          <Textarea
            placeholder={isClientView 
              ? "Add your feedback or questions..."
              : "Add a comment..."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          
          <div className="flex items-center justify-between">
            {!isClientView && (
              <div className="flex items-center gap-2">
                <Button
                  variant={isInternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsInternal(true)}
                  type="button"
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Internal
                </Button>
                <Button
                  variant={!isInternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsInternal(false)}
                  type="button"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Client Visible
                </Button>
              </div>
            )}
            
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className={cn(!isClientView && "ml-auto")}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Comment"}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <ScrollArea className="h-[400px] pr-4">
          {sortedComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No comments yet</p>
              <p className="text-sm mt-1">
                {isClientView 
                  ? "Be the first to add feedback"
                  : "Start the conversation"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedComments.map((comment) => (
                <div
                  key={comment._id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg",
                    comment.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className={cn(
                      comment.isInternal ? "bg-yellow-200" : "bg-blue-200"
                    )}>
                      {getAuthorInitials(comment)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.authorName || "Team Member"}
                      </span>
                      {comment.isInternal && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Internal
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    
                    {comment.updatedAt !== comment.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        (edited)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Comment Guidelines */}
        {isClientView && (
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Your comments will be visible to our team. 
              We'll respond to any questions or feedback as soon as possible.
            </p>
          </div>
        )}
        
        {!isClientView && comments.some(c => c.isInternal) && (
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Internal comments are only visible to your team
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}