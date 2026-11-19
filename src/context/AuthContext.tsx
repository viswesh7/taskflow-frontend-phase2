import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { endpoints } from '../services/endpoints';
import { tokenStore } from '../services/api';
import type { AuthResponse, User } from '../types';
type AuthContextValue={ user:User|null; login:(email:string,password:string)=>Promise<void>; register:(displayName:string,email:string,password:string)=>Promise<void>; logout:()=>Promise<void> };
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}) {
 const [user,setUser]=useState<User|null>(null); const queryClient=useQueryClient();
 useEffect(()=>{tokenStore.onExpired(()=>{setUser(null);queryClient.clear();});},[queryClient]);
 const accept=(data:AuthResponse)=>{tokenStore.set(data);setUser(data.user);};
 const value=useMemo<AuthContextValue>(()=>({
  user,
  login:async(email,password)=>accept(await endpoints.login({email,password})),
  register:async(displayName,email,password)=>accept(await endpoints.register({displayName,email,password})),
  logout:async()=>{const refresh=tokenStore.getRefresh(); tokenStore.clear();setUser(null);queryClient.clear();if(refresh){try{await endpoints.logout(refresh);}catch{ /* local session already cleared */ }}},
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }),[user,queryClient]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('AuthProvider missing');return context;}
