import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "./api";
import { type Order, type OrderStatus, hoursSince, STATUS_LIST } from "./types";

export function useOrders() {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export interface Metrics {
  total: number;
  byStatus: Record<OrderStatus, number>;
  today: number;
  week: number;
  month: number;
  deliveryRate: number;
  pendingRate: number;
  avgProcessingHours: number;
  trend: { label: string; value: number }[];
  distribution: { id: OrderStatus; label: string; value: number; color: string }[];
  topProducts: { name: string; value: number }[];
  cities: { name: string; value: number }[];
  stale: Order[];
}

export function useMetrics(orders: Order[] | undefined): Metrics {
  return useMemo(() => {
    const list = orders ?? [];
    const byStatus = STATUS_LIST.reduce((acc, s) => {
      acc[s.id] = 0;
      return acc;
    }, {} as Record<OrderStatus, number>);

    for (const o of list) {
      if (byStatus[o.status] !== undefined) byStatus[o.status] += 1;
    }

    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const weekStart = todayStart - 6 * 864e5;
    const monthStart = todayStart - 29 * 864e5;

    const at = (o: Order) => new Date(o.createdAt).getTime();
    const today = list.filter((o) => at(o) >= todayStart).length;
    const week = list.filter((o) => at(o) >= weekStart).length;
    const month = list.filter((o) => at(o) >= monthStart).length;

    // 14-day trend
    const trend: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = todayStart - i * 864e5;
      const end = start + 864e5;
      trend.push({
        label: new Intl.DateTimeFormat("ar-LY", {
          day: "numeric",
          month: "short",
        }).format(new Date(start)),
        value: list.filter((o) => at(o) >= start && at(o) < end).length,
      });
    }

    const distribution = STATUS_LIST.map((s) => ({
      id: s.id,
      label: s.label,
      value: byStatus[s.id],
      color: s.color,
    }));

    const tally = (key: (o: Order) => string) => {
      const m = new Map<string, number>();
      for (const o of list) {
        const k = (key(o) || "—").trim();
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return [...m.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    };

    const durations = list
      .filter((o) => o.status !== "pending" && o.updatedAt && o.createdAt)
      .map(
        (o) =>
          (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) /
          36e5
      )
      .filter((h) => h >= 0 && isFinite(h));

    const total = list.length || 0;

    return {
      total,
      byStatus,
      today,
      week,
      month,
      deliveryRate: total ? (byStatus.delivered / total) * 100 : 0,
      pendingRate: total ? (byStatus.pending / total) * 100 : 0,
      avgProcessingHours: durations.length
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0,
      trend,
      distribution,
      topProducts: tally((o) => o.name),
      cities: tally((o) => o.location),
      stale: list.filter(
        (o) => o.status === "pending" && hoursSince(o.createdAt) > 24
      ),
    };
  }, [orders]);
}
