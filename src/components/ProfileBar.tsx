"use client";

import { useState } from "react";
import type { BracketProfile } from "@/lib/types";
import { ProfileEditor } from "./ProfileEditor";

interface Props {
  profiles: BracketProfile[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: (
    name: string,
    avatar: string,
    color: string,
    seedFromActive: boolean,
  ) => void;
  onRename: (id: string, name: string, avatar: string, color: string) => void;
  onDelete: (id: string) => void;
  onCompare: () => void;
}

export function ProfileBar({
  profiles,
  activeId,
  onSwitch,
  onAdd,
  onRename,
  onDelete,
  onCompare,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<BracketProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BracketProfile | null>(
    null,
  );

  return (
    <>
      <div className="profile-bar" aria-label="Bracket profiles">
        <div className="profile-bar-label">Whose bracket?</div>
        <div className="profile-pills">
          {profiles.map((p) => {
            const active = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                className={`profile-pill ${active ? "active" : ""}`}
                onClick={() => onSwitch(p.id)}
                style={
                  active
                    ? ({
                        ["--pill-color" as string]: p.color,
                      } as React.CSSProperties)
                    : undefined
                }
                aria-pressed={active}
              >
                <span className="avatar" aria-hidden>
                  {p.avatar}
                </span>
                <span className="name">{p.name}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="profile-pill add"
            onClick={() => setShowAdd(true)}
          >
            <span className="avatar" aria-hidden>
              ＋
            </span>
            <span className="name">Add player</span>
          </button>
        </div>

        <div className="profile-bar-actions">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              setEditing(profiles.find((p) => p.id === activeId) ?? null)
            }
            title="Rename or change avatar"
          >
            ✏️ Edit
          </button>
          {profiles.length > 1 ? (
            <>
              <button
                type="button"
                className="btn btn-sm"
                onClick={onCompare}
                title="See everyone's picks"
              >
                👀 Compare
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() =>
                  setConfirmDelete(profiles.find((p) => p.id === activeId) ?? null)
                }
              >
                🗑️ Delete
              </button>
            </>
          ) : null}
        </div>
      </div>

      {showAdd ? (
        <ProfileEditor
          title="Add a new player"
          submitLabel="Add player"
          showSeedToggle
          onCancel={() => setShowAdd(false)}
          onSubmit={({ name, avatar, color, seedFromActive }) => {
            onAdd(name || "Player", avatar, color, seedFromActive);
            setShowAdd(false);
          }}
        />
      ) : null}

      {editing ? (
        <ProfileEditor
          title={`Edit ${editing.name}`}
          submitLabel="Save"
          initialName={editing.name}
          initialAvatar={editing.avatar}
          initialColor={editing.color}
          onCancel={() => setEditing(null)}
          onSubmit={({ name, avatar, color }) => {
            onRename(editing.id, name, avatar, color);
            setEditing(null);
          }}
        />
      ) : null}

      {confirmDelete ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDelete(null);
          }}
        >
          <div className="modal">
            <h3>
              Delete {confirmDelete.avatar} {confirmDelete.name}?
            </h3>
            <p>
              This will remove their bracket and all their picks. This can&rsquo;t
              be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  onDelete(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
