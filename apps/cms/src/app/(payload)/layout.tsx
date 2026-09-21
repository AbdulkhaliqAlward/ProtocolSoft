/* Payload admin root layout (CMS service serves ONLY the admin panel + APIs). */
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import type { ServerFunctionClient } from 'payload';
import React from 'react';
import configPromise from '@payload-config';

import { importMap } from './importMap.js';

import '@payloadcms/next/css';
import './custom.scss';

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function serverFunction(args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
