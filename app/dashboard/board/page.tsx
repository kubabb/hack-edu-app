'use client'

import React, { useState } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import { DrawingBoard } from '@/src/components/DrawingBoard';
import { BoardChat } from '@/src/components/BoardChat';
import { PencilRuler, Sparkles } from 'lucide-react';

export default function BoardPage() {
  const [pendingSnapshotUrl, setPendingSnapshotUrl] = useState<string | null>(null);

  const handleSnapshot = (base64Image: string) => {
    setPendingSnapshotUrl(base64Image);
  };

  const handleSnapshotSent = () => {
    setPendingSnapshotUrl(null);
  };

  return (
    <DashboardLayout>
      <section className="grid h-full grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        <div className="h-full w-full">
          <DrawingBoard onSendSnapshot={handleSnapshot} />
        </div>
        <div className="h-full w-full">
          <BoardChat 
            pendingSnapshotUrl={pendingSnapshotUrl} 
            onSnapshotSent={handleSnapshotSent} 
          />
        </div>
      </section>
    </DashboardLayout>
  );
}
