import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs";


async function page(){
    const user = await currentUser();

    const userInfo = {};
    const userData ={
        id:user?.id,
        objectId:userInfo?._id,
        username:userInfo?.username || user?.username,
        name: userInfo?.name || user?.firstName || "",
        bio: userInfo?.bio || "",
        image: userInfo?.image ||user?.imageUrl,
    }
    return (
        <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
            <h1 className="head-text"> Profile </h1>
            <p className="mt-3 text-base-regular text-light-2">
                complete your profile now to use EXpoNect
            </p>
            <section className="mt-9 bg-dark-2 p-10">
                <AccountProfile 
                    user={userData}
                    btnTitle="continue"
                    />
            </section>
          
        </main>
    )
    
    
}

export default page; 