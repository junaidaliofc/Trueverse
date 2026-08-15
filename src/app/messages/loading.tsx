import { ConversationListSkeleton } from "@/components/messages/messenger-skeletons";

export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-lg p-4 sm:max-w-6xl sm:p-0">
      <ConversationListSkeleton />
    </div>
  );
}
