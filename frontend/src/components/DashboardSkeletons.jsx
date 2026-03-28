import React from 'react'

const Shimmer = "animate-pulse bg-[var(--bg)] rounded-xl"

export const MetricSkeleton = () => (
  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between h-36 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-24 h-3 bg-[var(--bg)] rounded-full" />
      <div className="w-8 h-8 bg-[var(--bg)] rounded-xl" />
    </div>
    <div className="space-y-3">
      <div className="w-20 h-8 bg-[var(--bg)] rounded-lg" />
      <div className="w-28 h-2 bg-[var(--bg)] rounded-full" />
    </div>
  </div>
)

export const SearchSkeleton = () => (
  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 flex items-center shadow-sm animate-pulse h-[60px]">
    <div className="w-5 h-5 bg-[var(--bg)] rounded-full ml-3 shrink-0" />
    <div className="flex-1 ml-4 h-4 bg-[var(--bg)] rounded-full max-w-[300px]" />
    <div className="w-24 h-10 bg-[var(--bg)] rounded-lg mr-1 shrink-0" />
  </div>
)

export const AssetSkeleton = () => (
  <div className="flex items-center justify-between p-4 px-1 animate-pulse">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-12 h-12 rounded-xl bg-[var(--bg)] shrink-0" />
      <div className="flex flex-col gap-2.5">
        <div className="w-48 h-3.5 bg-[var(--bg)] rounded-full" />
        <div className="w-32 h-2.5 bg-[var(--bg)] rounded-full opacity-60" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="w-8 h-8 bg-[var(--bg)] rounded-lg" />
    </div>
  </div>
)

export const DashboardSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 pt-0">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-0">
      <div className="space-y-2">
        <div className="w-48 h-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg animate-pulse" />
        <div className="w-64 h-3 bg-[var(--surface)] border border-[var(--border)] rounded-full animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="w-24 h-10 bg-[var(--surface)] border border-[var(--border)] rounded-lg animate-pulse" />
        <div className="w-32 h-10 bg-[var(--surface)] border border-[var(--border)] rounded-lg animate-pulse" />
      </div>
    </div>

    {/* Search Skeleton */}
    <SearchSkeleton />

    {/* Metric Grid (3 Column Match) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
    </div>

    {/* Layout Split */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Recent Activity Label */}
        <div className="flex items-center justify-between px-1">
          <div className="w-32 h-4 bg-[var(--surface)] border border-[var(--border)] rounded-full animate-pulse" />
          <div className="w-16 h-3 bg-[var(--surface)] border border-[var(--border)] rounded-full animate-pulse" />
        </div>
        {/* Card Body */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm divide-y divide-[var(--border)] overflow-hidden">
          <AssetSkeleton />
          <AssetSkeleton />
          <AssetSkeleton />
          <AssetSkeleton />
          <AssetSkeleton />
          <AssetSkeleton />
        </div>
      </div>

      {/* Side Panels */}
      <div className="space-y-4">
        <div className="w-24 h-4 bg-[var(--surface)] border border-[var(--border)] rounded-full ml-1 mb-2 animate-pulse" />
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 h-[200px] animate-pulse" />
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 h-[200px] animate-pulse" />
      </div>
    </div>
  </div>
)
