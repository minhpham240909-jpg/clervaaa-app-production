import ChatPageClient from '@/components/chat/ChatPageClient'

// This page uses dynamic client features
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function MessagesPage() {
  return <ChatPageClient />
}