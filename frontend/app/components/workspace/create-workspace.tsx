import { workspaceschema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { useCreateWorkspace } from '@/hooks/use-workspace';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

interface CreateWorkspaceProps {
    isCreatingWorkspace: boolean;
    setIsCreatingWorkspace: (isCreatingWorkspace: boolean) => void;
}
export const colorOptions = [
    "#FF5733",//Red-Orange
    "#33C1FF",//blue
    "#28A745",//green
    "#FFC300",//yellow
    "#8E44AD",//purple
    "#E67E22",//orange
    "#2ECC71",//teal
    "#3498DB",//blue-green
];

export type WorkspaceForm = z.infer<typeof workspaceschema>
export const CreateWorkspace = ({
    isCreatingWorkspace,
    setIsCreatingWorkspace,
}: CreateWorkspaceProps
) => {
    const form = useForm<WorkspaceForm>({
        resolver: zodResolver(workspaceschema),
        defaultValues: {
            name: "",
            color: colorOptions[0],
            description: "",
        },
    });
    const navigate = useNavigate();
    const {mutate,isPending} = useCreateWorkspace();
    const onSubmit = (data: WorkspaceForm) => {
        mutate(data,{
            onSuccess: (data:any) => {
                form.reset();
                setIsCreatingWorkspace(false)
                toast.success("Workspace created successfully");
                navigate(`/workspaces/${data._id}`);
            },
            onError: (error:any) => {
                const errorMessage = error.response.data.message 
                console.log(error);
                toast.error(errorMessage);

            }
        });
    }
    return (
        <Dialog open={isCreatingWorkspace} onOpenChange={setIsCreatingWorkspace} modal={true}>
            <DialogContent className='max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTrigger>Create Workspace</DialogTrigger>

                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='space-y-4 py-4'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Worskspace Name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder='Workspace Description'
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='color'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <div className='flex flex-wrap gap-3'>
                                                {colorOptions.map((color) => (
                                                    <div
                                                        key={color}
                                                        className={cn('w-6 h-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300',
                                                            field.value === color && 'ring-2 ring-offset-2 ring-blue-500'
                                                        )}
                                                        onClick={() => field.onChange(color)}
                                                        style={{ backgroundColor: color }}
                                                    >
                                                    </div>
                                                ))}

                                            </div>

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? "Creating ..." : "Create"}

                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}