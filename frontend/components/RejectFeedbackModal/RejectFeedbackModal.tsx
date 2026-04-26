"use client";

import { useState } from "react";
import Button from "../buttons/Button/Button";
import "./RejectFeedbackModal.scss";

interface RejectFeedbackModalProps {
  isOpen: boolean;
  postTitle: string;
  onCancel: () => void;
  onConfirm: (feedback: string) => void;
}

export default function RejectFeedbackModal({
  isOpen,
  postTitle,
  onCancel,
  onConfirm,
}: RejectFeedbackModalProps) {
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(feedback);
    setFeedback("");
  };

  const handleCancel = () => {
    setFeedback("");
    onCancel();
  };

  return (
    <div className="reject-modal-overlay" onClick={handleCancel}>
      <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reject-modal__header">
          <h2 className="reject-modal__title">Reject Post</h2>
          <button className="reject-modal__close" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <p className="reject-modal__subtitle">
          Rejecting <strong>&quot;{postTitle}&quot;</strong> will move it back
          to draft. Let the author know why.
        </p>

        <div className="reject-modal__field">
          <label className="reject-modal__label" htmlFor="reject-feedback">
            Feedback <span className="reject-modal__optional">(optional)</span>
          </label>
          <textarea
            id="reject-feedback"
            className="reject-modal__textarea"
            placeholder="e.g. The caption needs to be shorter, and please update the image..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>

        <div className="reject-modal__actions">
          <Button
            text="Cancel"
            link="#"
            color="#374151"
            bgColor="#f3f4f6"
            onClick={handleCancel}
          />
          <Button
            text="Reject Post"
            link="#"
            color="white"
            bgColor="#e53935"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
