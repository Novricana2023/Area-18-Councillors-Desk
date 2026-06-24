"use client";



import Link from "next/link";

import { formatDistanceToNow } from "date-fns";

import { Bell } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { LoadingSpinner } from "@/components/LoadingSpinner";

import { useAuth } from "@/context/AuthContext";

import { api } from "@/lib/api";

import type { NotificationDto } from "@/lib/types";

import { cn } from "@/lib/utils";



export function NotificationBell() {

  const { isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);

  const [count, setCount] = useState(0);

  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  const [loading, setLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);



  const fetchCount = useCallback(async () => {

    if (!isAuthenticated) return;

    try {

      const result = await api.notifications.getUnreadCount();

      setCount(result.count);

    } catch {

      setCount(0);

    }

  }, [isAuthenticated]);



  const fetchNotifications = useCallback(async () => {

    if (!isAuthenticated) return;

    setLoading(true);

    try {

      const data = await api.notifications.getAll(false, 1, 8);

      setNotifications(data);

    } catch {

      setNotifications([]);

    } finally {

      setLoading(false);

    }

  }, [isAuthenticated]);



  useEffect(() => {

    fetchCount();

    const interval = setInterval(fetchCount, 15000);

    return () => clearInterval(interval);

  }, [fetchCount]);



  useEffect(() => {

    if (open) fetchNotifications();

  }, [open, fetchNotifications]);



  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {

        setOpen(false);

      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);



  if (!isAuthenticated) return null;



  async function handleMarkRead(id: string) {

    await api.notifications.markAsRead(id);

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

    fetchCount();

  }



  return (

    <div className="relative" ref={panelRef}>

      <button

        type="button"

        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}

        onClick={() => setOpen((v) => !v)}

        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-charcoal transition hover:bg-muted"

      >

        <Bell className="h-4 w-4" />

        {count > 0 && (

          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">

            {count > 9 ? "9+" : count}

          </span>

        )}

      </button>



      {open && (

        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-white shadow-lg">

          <div className="flex items-center justify-between border-b border-border px-4 py-3">

            <p className="font-semibold text-charcoal">Notifications</p>

            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs font-medium text-navy hover:underline">

              View all

            </Link>

          </div>

          <div className="max-h-80 overflow-y-auto">

            {loading ? (

              <div className="py-8"><LoadingSpinner /></div>

            ) : notifications.length === 0 ? (

              <p className="px-4 py-8 text-center text-sm text-muted-fg">No notifications yet</p>

            ) : (

              notifications.map((notification) => (

                <button

                  key={notification.id}

                  type="button"

                  onClick={() => {

                    if (!notification.isRead) handleMarkRead(notification.id);

                    if (notification.actionUrl) window.location.href = notification.actionUrl;

                    setOpen(false);

                  }}

                  className={cn(

                    "block w-full border-b border-border px-4 py-3 text-left transition hover:bg-muted",

                    !notification.isRead && "bg-accent-light/50",

                  )}

                >

                  <p className="text-sm font-medium text-charcoal">{notification.title}</p>

                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-fg">{notification.message}</p>

                  <p className="mt-1 text-[10px] text-muted-fg">

                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}

                  </p>

                </button>

              ))

            )}

          </div>

        </div>

      )}

    </div>

  );

}

