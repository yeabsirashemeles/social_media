"use client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel, 
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { CommentValidation } from '@/lib/validations/thread';
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { addCommnetToThread } from "@/lib/actions/thread.actions";
//import { createThread } from "@/lib/actions/thread.actions";
// import { updateUser } from "@/lib/actions/user.actions";




interface Props{
    threadId: string;
    currentUserImg: string;
    currentUserId: string; 
}
const Comment=({threadId, currentUserImg, currentUserId}:Props)=>{
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues:{ 
        thread: '',     
    }
})

 const onSubmit= async(values: z.infer<typeof CommentValidation>)=>{
  await addCommnetToThread(threadId, values.thread,  JSON.parse(currentUserId), pathname);

    form.reset(); 
 }

    return(
        <Form {...form}>
        <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="comment-form">
            
            <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex w-full  items-center gap-3">
                <FormLabel>
                   <Image
                      src={currentUserImg}
                      alt = "profile image"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                      />
                </FormLabel>
                <FormControl
                className="border-none bg-transparent"
                >
                  <Input
                    type="text"
                    placeholder="comment..."
                    className="no-focus text-light-1 outline-none "
                    
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
        />
        <Button type="submit" className="comment-form_btn">
            Reply 
        </Button>

        </form>
        </Form>
    )
}

export default Comment;