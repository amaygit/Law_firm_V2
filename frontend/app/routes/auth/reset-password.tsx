import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage,Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useResetPasswordMutation } from '@/hooks/use-auth'
import { resetPasswordSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useForm,FormProvider  } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import type { z } from 'zod'


type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPasswordMutation();
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (values: ResetPasswordFormData) => {
    if(!token){
      toast.error("Invalid token. Please try again.");
      return;
    }
    resetPassword({
      ...values,token:token as string
    },
    {
      onSuccess: () => {
        setIsSuccess(true);
        toast.success("Password reset successful");
      },
      onError: (error:any) => {
        const errorMessage = error.response?.data?.message;
        toast.error("Failed to reset password");
        console.log(error);
      },
    }
  )
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className='text-muted-foreground'>
            Enter your new password below.
          </p>
        </div>
        <Card>
          <CardHeader>
            <Link to="/sign-in" className='flex items-center gap-2'>
              <ArrowLeft className='w-4 h-4' />
              <span>Back to sign-in</span>
            </Link>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className='flex flex-col items-center justify-center'>
                <CheckCircle className='w-10 h-10 text-green-500' />
                <h1 className="text-2xl font bold">Password reset successfull
                </h1>
              </div>) : (
                
            <Form {...form} >
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    name="newPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter new password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Confirm new password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                  type="submit"
                  className="w-full" 
                  disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </Form>
         
            )
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword