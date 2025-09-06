import React, { useState } from 'react'
import { useAuth } from '@/provider/auth-context'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import {Header } from '@/components/layout/header'
import { Navigate, Outlet } from 'react-router'
import type { Workspace } from '@/types'
import { SideBarComponent } from '@/components/layout/sidebar-component'
import { CreateWorkspace } from '@/components/workspace/create-workspace'
import { fetchData } from '@/lib/fetch-util'

export const clientLoader = async()=>{
    try {
        const [workspaces] = await Promise.all([
           fetchData("/workspaces")
        ]);
        return {workspaces};
    } catch (error) {
        console.log(error)
    }
}

const DashboardLayout = () => {
  const {isAuthenticated,isLoading} =useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  if(isLoading) {
    return <Loader />
  }
  if(!isAuthenticated) {
    return <Navigate to="/sign-in" />
  }
  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace)
  }
  return (
    <div className='flex h-screen w-full'>
        {/* SideBarComponent */}
        <SideBarComponent currentWorkspace={currentWorkspace}/>
        <div className='flex flex-1 flex-col h-full'>
          <Header 
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={()=>setIsCreatingWorkspace(true)}
          />

          <main className='flex-1 overflow-y-auto h-full w-full'>
           <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
             <Outlet />
           </div>
          </main>
        </div>
        <CreateWorkspace 
            isCreatingWorkspace={isCreatingWorkspace}
            setIsCreatingWorkspace={setIsCreatingWorkspace}
        />
    </div>
  )
}

export default DashboardLayout