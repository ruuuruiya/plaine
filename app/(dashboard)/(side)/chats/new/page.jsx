import { auth } from '@/app/api/auth/[...nextauth]/route'
import ChatComponent from '@/components/pages/dashboard/side/chats/ChatComponent'
import { nanoid } from '@/lib/utils';

export const metadata = {
  title: 'New Chat',
  description: 'Start a new Chat with AI',
};

const Page = async () => {

  const auth_session = await auth();
  const chat_id = nanoid();

  return (
    <div className="h-full overflow-hidden flex flex-col justify-between">
      <ChatComponent chat_id={chat_id} session={auth_session}/>
    </div>
  )
}

export default Page
