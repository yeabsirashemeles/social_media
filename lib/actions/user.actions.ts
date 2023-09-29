"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params{
    userId: String,
    username: String,
    name: String,
    bio: String,
    image: String,
    path: String,
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,    
} : Params): Promise<void>{
    connectToDB();

    try{
        await User.findOneAndUpdate(
            {id:userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            {
                upsert: true
            }
        
            
        );
    
        if(path ==='/profile/edit'){
            revalidatePath(path); 
        }
    }catch(error){
        throw new Error(`failed to update user: ${error.message}`);
       
    }
}

export async function fetchUser(userId: string){
    try{
        connectToDB();
        return await User.findOne({id: userId})
        //.populate({
          //  path:'communities',
            //model:community,
      //  })
    }catch(error:any){
        throw new Error( `failed to fetch User:${error.message}`)
    }
}

export async function fetchUserposts(userId: string){
    try{
        connectToDB();
        // toDO populate community
        //fetch all threads specific userID
        const threads = await User.findOne({id:userId})
            .populate({
                path:'threads',
                model:Thread,
                populate:{
                    path:'children',
                    model: Thread,
                    populate:{
                        path:'author',
                        model: User,
                        select:'name image id'
                    }
                }
            })
            return threads;
    }catch(error:any){
        throw new Error(`new error in fetchuserposts: ${error.message}`);
    }
}

export async function fetchUsers({
    userId,
    searchString= "",
    totalPage =1,
    pageSize = 20,
    sortBy = "desc"
}:{
    userId : string;
    searchString ?: string;
    totalPage?: number;
    pageSize ?: number;
    sortBy?: SortOrder;
}){
    try{

        connectToDB();

        const skip = (totalPage -1) * pageSize;
        // case insenstive for searching users
        const regex = new RegExp(searchString, "i");
        const query: FilterQuery<typeof User> ={
            id: {$ne:userId}
        }
        if(searchString.trim()!==""){
            query.$or =[
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        }
        const sortOptions = { createdAt : sortBy};
        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();
        const isNext = totalUsersCount> skip + users.length;
        return{ users, isNext};
    }catch(error:any){
        throw new Error(`new error in search:${error.message}`);
    }
}

export async function  getActivity(userId: string){
    try{
        connectToDB();
        //findallthreads created
        const userThreads = await Thread.find({author:userId});
        //collect all comments and replies
        const childIds = userThreads.reduce((acc, userThread)=>{
            return acc.concat(userThread.children)
        }, [])

        // get accesss to all replies
        const replies  = await Thread.find ({
            _id: {$in: childIds},
            author:{ $ne: userId}   
        }).populate({
            path:'author',
            model: User,
            select: 'name image _id'
        })
        return replies;
    }catch(error:any){
        throw new Error(`failed to get notification:${error.message}`)
    }
} 