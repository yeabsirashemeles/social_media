import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page(){
    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect('/board');
    return(
    <>
    <h1 className="head-text">create Thread</h1>
    <PostThread userId = {userInfo._id}/>
    </>
    )
}

export default Page;