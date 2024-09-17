import React from 'react';
import { Button, Input } from 'antd';
import { ProposalComment } from './types'; // Adjust the import path as necessary

const { TextArea } = Input;

interface CommentSectionProps {
  comments?: ProposalComment[];
  comment: string;
  setComment: (value: string) => void;
  handleCommentSubmit: () => void;
  updating: boolean;
  placeholder?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  comment,
  setComment,
  handleCommentSubmit,
  updating,
  placeholder = 'Leave a comment...',
}) => {
  return (
    <>
      <h5 className="mt-2 font-semibold">Comments:</h5>
      <ul className="markdown-body">
        {comments?.map((comment) => (
          <li key={comment.id} className="mt-2">
            <strong>{comment.user.name}:</strong> {comment.text}
            <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>

      <TextArea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      <Button type="primary" className="mt-2" onClick={handleCommentSubmit} disabled={updating}>
        Submit Comment
      </Button>
    </>
  );
};

export default CommentSection;
