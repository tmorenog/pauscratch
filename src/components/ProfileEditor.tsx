"use client";

import { useState } from "react";
import { AVATAR_OPTIONS, PROFILE_COLORS } from "@/lib/types";

interface Props {
  title: string;
  initialName?: string;
  initialAvatar?: string;
  initialColor?: string;
  showSeedToggle?: boolean;
  initialSeed?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (data: {
    name: string;
    avatar: string;
    color: string;
    seedFromActive: boolean;
  }) => void;
}

export function ProfileEditor({
  title,
  initialName = "",
  initialAvatar = AVATAR_OPTIONS[0],
  initialColor = PROFILE_COLORS[0],
  showSeedToggle = false,
  initialSeed = false,
  submitLabel = "Save",
  onCancel,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [color, setColor] = useState(initialColor);
  const [seed, setSeed] = useState(initialSeed);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-editor-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal" style={{ maxWidth: 480 }}>
        <h3 id="profile-editor-title">{title}</h3>

        <label
          htmlFor="profile-name"
          style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}
        >
          Player name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          autoFocus
          maxLength={24}
          placeholder="e.g. Pau, Mom, Dad"
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--bg-elev)",
            color: "var(--text)",
            fontSize: 15,
            marginBottom: 16,
          }}
        />

        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Pick an avatar
        </div>
        <div className="avatar-grid">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`avatar-cell ${avatar === emoji ? "selected" : ""}`}
              onClick={() => setAvatar(emoji)}
              aria-label={`Avatar ${emoji}`}
              aria-pressed={avatar === emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, margin: "16px 0 6px" }}>
          Team color
        </div>
        <div className="color-grid">
          {PROFILE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-cell ${color === c ? "selected" : ""}`}
              onClick={() => setColor(c)}
              style={{ background: c }}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </div>

        {showSeedToggle ? (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <input
              type="checkbox"
              checked={seed}
              onChange={(e) => setSeed(e.target.checked)}
            />
            Start from the current bracket&rsquo;s picks
          </label>
        ) : null}

        <div className="modal-actions" style={{ marginTop: 18 }}>
          <button type="button" className="btn btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() =>
              onSubmit({ name, avatar, color, seedFromActive: seed })
            }
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
