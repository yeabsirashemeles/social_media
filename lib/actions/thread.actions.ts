"use server"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params{
    text:string,
    author:string,
    communityId: string |null,
    path:string,
}
export async function createThread({text,author,communityId, path}:Params){
   try{
     connectToDB();
    const createdThread = await Thread.create({
        text,
        author,
        community:null,
    });
    //update user model
    await User.findByIdAndUpdate(author,{
        $push:{ threads: createdThread._id}
    })
    revalidatePath(path);
}catch(error:any){
    throw new Error(`found error in thread.actions${error.message}`);
}}

export async function fetchPosts(pageNumber= 1, pageSize=20){
    connectToDB();

    //to know which page we are
    const amount = (pageNumber-1)* pageSize;

    // fetch top level threads not comments
    const postsQuery = Thread.find({parentId:{$in: [null, undefined]}})
    .sort({createdAt:'descending'})
    .skip(amount)
    .limit(pageSize)
    .populate({path:'author', model:User})
    .populate({
        path:'children',
        populate: {
            path: 'author',
            model: User,
            select:"_id name parentId image"
        }
    })

    const PostCount = await Thread.countDocuments({
        parentId:{$in:[null, undefined]}
    })

    const posts = await postsQuery.exec();

    const isNext = PostCount > amount + posts.length;

    return {posts, isNext};
}

export async function fetchThreadById(id: string){
    connectToDB();
    try{
        // todo: populate community
        const thread = await Thread.findById(id)
        .populate({
            path:'author',
            model: User,
            select:"_id id name image"
        })//next for comment
        .populate({
            path:'children',
            populate:[
                {
                    path:'author',
                    model:User,
                    select:'_id id name parentId image'
                },
                {
                    path:'children',
                    model:Thread,
                    populate:{
                        path:'author',
                        model: User,
                        select:'_id id name parentId image'
                    }
                }
            ]
        }).exec();
        return thread;
    }catch(error:any){
        throw new Error (`Error fetch tweets: ${error.message}`)
    }
}

export async function addCommnetToThread(
    threadId: string,
    commentText : string,
    userId: string,
    path: String,
    ){
        connectToDB();

        try{
            //adding comment to thread
            const originalThread = await Thread.findById(threadId);
            if(!originalThread){
                throw new Error ("thread not found")
            }
// create a new thread comment
            const commentThread = new Thread({
                text: commentText,
                author: userId,
                parentId: threadId,
            })

            //save to databse
            const savedCommentThread = await commentThread.save();
            // update thread
            originalThread.children.push(savedCommentThread._id);
            //save the thread
            await originalThread.save();

            revalidatePath(path);
            
        }catch(error:any){
            throw new Error(`Error adding comment to thread:${error.message}`)
        }
    }