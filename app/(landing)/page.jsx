import HomePage from "@/components/pages/landing/homepage/HomePage"
import { auth } from "../api/auth/[...nextauth]/route";

const Page = async () => {
  const auth_session = await auth();
  return (
    <div className='pt-20 flex flex-col overflow-hidden'>
      <HomePage session={auth_session} />
    </div>
  )
}

export default Page
