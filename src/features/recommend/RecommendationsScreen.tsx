import { ChatFeed } from '@/features/recommend/ChatFeed';
import { ChatHeader } from '@/features/recommend/ChatHeader';
import { VibeForm } from '@/features/recommend/VibeForm';
import { useRecommendations } from '@/features/recommend/useRecommendations';

export function RecommendationsScreen() {
  const { status, messages, submit } = useRecommendations();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-base">
      <ChatHeader />

      <ChatFeed messages={messages} status={status} />

      <VibeForm onSubmit={submit} isSubmitting={status === 'loading'} />
    </div>
  );
}
