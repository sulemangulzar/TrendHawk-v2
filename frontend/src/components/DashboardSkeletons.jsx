import React from 'react'

export const MetricSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-4 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="w-4 h-4 bg-muted rounded" />
      <div className="w-16 h-2 bg-muted rounded" />
    </div>
    <div className="flex items-baseline gap-2 mt-2">
      <div className="w-12 h-8 bg-muted rounded" />
      <div className="w-8 h-3 bg-muted rounded" />
    </div>
  </div>
)

export const ChartSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-pulse h-full">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-muted rounded" />
        <div className="w-32 h-4 bg-muted rounded" />
      </div>
      <div className="w-24 h-3 bg-muted rounded" />
    </div>
    <div className="h-[240px] w-full bg-muted/30 rounded-xl" />
  </div>
)

export const AssetSkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-xl animate-pulse">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
      <div className="flex flex-col gap-2">
        <div className="w-24 h-3 bg-muted rounded" />
        <div className="w-16 h-2 bg-muted rounded" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="w-8 h-8 bg-muted rounded-lg" />
      <div className="w-8 h-8 bg-muted rounded-lg" />
    </div>
  </div>
)

export const DashboardSkeleton = () => (
  <div className="pb-12 font-poppins text-foreground max-w-5xl mx-auto px-4 lg:px-6">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-8">
      <div className="space-y-1">
        <div className="w-24 h-3 bg-muted rounded animate-pulse" />
        <div className="w-32 h-8 bg-muted rounded animate-pulse" />
      </div>
      <div className="w-full md:w-[280px] h-10 bg-muted rounded-xl animate-pulse" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
      <div className="bg-muted border border-border rounded-xl p-4 shadow-sm animate-pulse" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ChartSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-muted/40 border border-border rounded-xl animate-pulse" />
          <div className="h-20 bg-muted/40 border border-border rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl flex flex-col shadow-sm h-[500px] animate-pulse">
        <div className="p-5 border-b border-border h-12" />
        <div className="p-2 space-y-2">
          <AssetSkeleton />
          <AssetSkeleton />
          <AssetSkeleton />
          <AssetSkeleton />
          <AssetSkeleton />
        </div>
      </div>
    </div>
  </div>
)
