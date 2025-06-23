// src/contexts/SessionContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { Session } from 'next-auth';

export const SessionContext = createContext<Session | null>(null);
export const useSession = () => useContext(SessionContext);
