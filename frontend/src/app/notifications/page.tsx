"use client";

import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import type { NotificationDto } from "@/lib/types";
import { badgeAccentClass, btnGhostClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  return (
    <AppShell>
      <ProtectedRoute>
        <NotificationsContent />
      </ProtectedRoute>
    </AppShell>
  );
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setNotifications(await api.notifications.getAll(false, 1, 50));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markAllRead() {
    await api.notifications.markAllAsRead();
    await load();
  }

  async function markRead(id: string) {
    await api.notifications.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <PageHeader
        title="Notifications"
        subtitle="Updates on your issues and community activity"
        actions={<button type="button" onClick={markAllRead} className={btnGhostClass}>Mark all read</button>}
      />

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : notifications.length === 0 ? (
        <p className="text-center text-sm text-muted-fg">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => {
                if (!notification.isRead) markRead(notification.id);
                if (notification.actionUrl) window.location.href = notification.actionUrl;
              }}
              className={cn(
                "block w-full rounded-lg border p-4 text-left transition hover:border-navy/20",
                notification.isRead ? "border-border bg-card" : "border-accent/30 bg-accent-light/30",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-charcoal">{notification.title}</p>
                <span className={badgeAccentClass}>{NOTIFICATION_TYPE_LABELS[notification.type]}</span>
              </div>
              <p className="mt-1 text-sm text-muted-fg">{notification.message}</p>
              <p className="mt-2 text-xs text-muted-fg">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
