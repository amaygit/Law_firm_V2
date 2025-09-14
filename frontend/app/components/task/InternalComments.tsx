import type { InternalComment, User } from "@/types";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  useAddInternalCommentMutation,
  useGetInternalCommentsByTaskIdQuery,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "../loader";

export const InternalCommentSection = ({
  taskId,
  members,
}: {
  taskId: string;
  members: User[];
}) => {
  const [newComment, setNewComment] = useState("");

  const { mutate: addInternalComment, isPending } =
    useAddInternalCommentMutation();
  const { data: internalComments, isLoading } =
    useGetInternalCommentsByTaskIdQuery(taskId) as {
      data: InternalComment[];
      isLoading: boolean;
    };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addInternalComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Internal comment added successfully");
        },
        onError: (error: any) => {
          toast.error(error.response.data.message);
          console.log(error);
        },
      }
    );
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Internal Comments</h3>

      <ScrollArea className="h-[300px] mb-4">
        {internalComments?.length > 0 ? (
          internalComments.map((comment) => (
            <div key={comment._id} className="flex gap-4 py-2">
              <Avatar className="size-8">
                <AvatarImage src={comment.author.profilePicture} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">
                    {comment.author.name}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              No internal comment yet
            </p>
          </div>
        )}
      </ScrollArea>

      <Separator className="my-4" />

      <div className="mt-4">
        <Textarea
          placeholder="Add an internal comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <div className="flex justify-end mt-4">
          <Button
            disabled={!newComment.trim() || isPending}
            onClick={handleAddComment}
          >
            Post Internal Comment
          </Button>
        </div>
      </div>
    </div>
  );
};
