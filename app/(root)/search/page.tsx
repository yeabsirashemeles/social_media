import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import UserCard from "@/components/cards/UserCard";


async function Page(){
   
    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
 
    if(!userInfo?.onboarded) redirect('/board');  
  
    // fetch all User
    const result = await fetchUsers({
        userId:  user.id,
        searchString : "",
        totalPage: 1,
        pageSize: 25,
    })
   return (
    <section>
        <h1 className="head-text mb-10">Search Page</h1>
        {/*search Bar */}
        <div className="mt-14 flex flex-col gap-9">
            {result.users.length === 0?(
                <p className="no-result">No Users</p>
            ):(
                <>
                    {result.users.map((searchText)=>(
                        <UserCard
                            key = {searchText.id}
                            id ={searchText.id}
                            name = {searchText.name}
                            username = {searchText.username}
                            imgUrl = {searchText.image}
                            type = 'User'
                        />
                    ))}
                </>
            )}

        </div>
    </section>
  )
}

export default Page 