"use client";
import React from 'react';
import { DataProvider } from '../context/DataContext';

export default function Providers({ children }) {
  return (
    <DataProvider>
      {children}
    </DataProvider>
  );
}
