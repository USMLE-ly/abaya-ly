'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/line-charts-9';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from 'recharts';

export interface RevenuePoint {
  date: string;
  value: number;
}

export interface RevenueOverviewCardProps {
  title?: string;
  balance: number;
  today: number;
  changePct: number;
  series: RevenuePoint[];
  currency?: string;
  className?: string;
}

const PINK = '#CE2C60';
const GOLD = '#B48A45';

const chartConfig = {
  value: {
    label: 'الإيراد',
    color: PINK,
  },
} satisfies ChartConfig;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RevenuePoint;
  }>;
  label?: string;
  currency: string;
}

const RevenueTooltip = ({ active, payload, currency }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div dir="rtl" className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <div className="text-sm text-muted-foreground mb-1">{data.date}</div>
        <div className="flex items-center gap-2">
          <div className="text-base font-bold tabular-nums">
            {data.value.toLocaleString()} {currency}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueOverviewCard({
  title = 'إيرادات القطع',
  balance,
  today,
  changePct,
  series,
  currency = 'د.ل',
  className,
}: RevenueOverviewCardProps) {
  const hasData = series.length > 0;
  const highValue = hasData ? Math.max(...series.map((d) => d.value)) : 0;
  const lowValue = hasData ? Math.min(...series.map((d) => d.value)) : 0;
  const lastDate = hasData ? series[series.length - 1].date : undefined;
  const changeUp = changePct >= 0;

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-stretch gap-5">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base text-muted-foreground font-medium mb-1">{title}</h2>
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3.5">
            <span className="text-4xl font-bold tabular-nums">{balance.toLocaleString()}</span>
            <span className="text-xl font-semibold text-gray-400">{currency}</span>
            <div className="flex items-center gap-1" style={{ color: changeUp ? '#16A34A' : '#DC2626' }}>
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">{changeUp ? '+' : ''}{changePct}%</span>
              <span className="text-muted-foreground font-normal">عن الأمس</span>
            </div>
          </div>
        </div>

        {!hasData ? (
          <p className="py-16 text-center text-sm text-muted-foreground">لا توجد بيانات كافية لعرض الرسم البياني</p>
        ) : (
          <div className="grow">
            {/* Stats Row */}
            <div className="flex items-center justify-between flex-wrap gap-2.5 text-sm mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">مبيعات اليوم:</span>
                <span className="font-semibold tabular-nums">
                  {today.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex items-center gap-6 text-muted-foreground">
                <span>
                  أعلى يوم: <span className="font-medium tabular-nums" style={{ color: GOLD }}>{highValue.toLocaleString()}</span>
                </span>
                <span>
                  أدنى يوم: <span className="font-medium tabular-nums" style={{ color: PINK }}>{lowValue.toLocaleString()}</span>
                </span>
                <span>
                  التغير: <span className="font-medium tabular-nums" style={{ color: changeUp ? '#16A34A' : '#DC2626' }}>{changeUp ? '+' : ''}{changePct}%</span>
                </span>
              </div>
            </div>

            {/* Chart */}
            <ChartContainer
              config={chartConfig}
              className="h-96 w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
            >
              <ComposedChart
                data={series}
                margin={{ top: 20, right: 10, left: 5, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="nadineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartConfig.value.color} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={chartConfig.value.color} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 8"
                  stroke="var(--input)"
                  strokeOpacity={0.6}
                  horizontal={true}
                  vertical={false}
                />

                {lastDate && (
                  <ReferenceLine x={lastDate} stroke={GOLD} strokeDasharray="4 4" strokeWidth={1} />
                )}

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickMargin={12}
                  interval="preserveStartEnd"
                  tickCount={6}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(value: number) => `${value.toLocaleString()}`}
                  tickMargin={12}
                  width={64}
                />

                <ChartTooltip
                  content={<RevenueTooltip currency={currency} />}
                  cursor={{ strokeDasharray: '3 3', stroke: 'var(--muted-foreground)', strokeOpacity: 0.5 }}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartConfig.value.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: chartConfig.value.color, stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RevenueOverviewCard;
